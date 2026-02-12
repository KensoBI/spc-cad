import {
  dateTime,
  Field,
  FieldColorModeId,
  FieldType,
  getDisplayProcessor,
  ThresholdsConfig,
  ThresholdsMode,
  TimeRange,
  toDataFrame,
  toFixed,
} from '@grafana/data';
import {
  Alert,
  GraphFieldConfig,
  GraphGradientMode,
  GraphThresholdsStyleConfig,
  GraphThresholdsStyleMode,
  LegendDisplayMode,
  LineInterpolation,
  PanelContextProvider,
  TimeSeries,
  TooltipDisplayMode,
  TooltipPlugin,
  usePanelContext,
  useTheme2,
} from '@grafana/ui';
import { TIMESERIES_SAMPLE_LABEL } from 'constants/global';
import React from 'react';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { AnnotationsPlugin, isAnnotationEntityArray } from './AnnotationPlugin';
import { AxisPropsReflection } from './AxisPropsReflection';

const FORECAST_LOWER_FIELD = 'forecast-lower';
const FORECAST_UPPER_FIELD = 'forecast-upper';

type ForecastBoundsFields = {
  upper: { time: Field<number>; values: Field<any> };
  lower: { time: Field<number>; values: Field<any> };
};

type Props = {
  dataFrameName: string;
  timeField?: Field<number>;
  valueField?: Field<any>;
  limits?: {
    up?: {
      value: number;
      color: string;
    };
    down?: {
      value: number;
      color: string;
    };
  };
  constants?: Array<{
    value: number;
    color: string;
    title: string;
  }>;
  lineWidth: number;
  pointSize: number;
  fill: number;
  width: number;
  height: number;
  lineColor: string;
  showLegend: boolean;
  decimals: number;
  calculationType?: string;
  onSeriesColorChange: (label: string, color: string) => void;
  forecastBounds?: ForecastBoundsFields;
};

export function SpcChart(props: Props) {
  const {
    timeField,
    valueField,
    limits,
    constants,
    dataFrameName,
    lineWidth,
    pointSize,
    fill,
    width,
    height,
    lineColor,
    showLegend,
    decimals,
    calculationType,
    onSeriesColorChange,
    forecastBounds,
  } = props;
  const { timeZone, timeRange } = usePanelProps();
  const theme = useTheme2();

  const dataFrames = React.useMemo(() => {
    if (timeField == null || valueField == null) {
      return undefined;
    }

    // NEW: Shallow spread instead of cloneDeep
    const valField = { ...valueField };
    const fields = [{ ...timeField }];

    const addConstantField = (value: number, name: string, color: string) => {
      fields.push({
        name: name,
        values: valField.values.map(() => value),
        config: {
          color: {
            mode: FieldColorModeId.Fixed,
            fixedColor: color,
          },
        },
        type: FieldType.number,
      });
    };

    if (constants) {
      for (const c of constants) {
        addConstantField(c.value, c.title, c.color);
      }
    }

    const thresholds: ThresholdsConfig = {
      mode: ThresholdsMode.Absolute,
      steps: [],
    };

    if (limits != null) {
      if (limits.down != null && limits.up == null) {
        thresholds.steps = [
          {
            color: limits.down.color,
            value: -Infinity,
          },
          {
            color: 'transparent',
            value: limits.down.value,
          },
        ];
      } else if (limits.down == null && limits.up != null) {
        thresholds.steps = [
          {
            color: 'transparent',
            value: -Infinity,
          },
          {
            color: limits.up.color,
            value: limits.up.value,
          },
        ];
      } else if (limits.down != null && limits.up != null && limits.down.value < limits.up.value) {
        thresholds.steps = [
          {
            color: limits.down.color,
            value: -Infinity,
          },
          {
            color: 'transparent',
            value: limits.down.value,
          },
          {
            color: limits.up.color,
            value: limits.up.value,
          },
        ];
      }
    }

    const hasTresholds = thresholds.steps.length > 0;

    const thresholdsStyle: GraphThresholdsStyleConfig = {
      mode: GraphThresholdsStyleMode.Area,
    };

    const custom: GraphFieldConfig = {
      ...(valField.config?.custom ?? {}),
      gradientMode: GraphGradientMode.Opacity,
      lineWidth: lineWidth,
      lineInterpolation: LineInterpolation.Smooth,
      thresholdsStyle,
      pointSize: pointSize,
      fillOpacity: fill * 10,
    };

    valField.config = {
      thresholds: hasTresholds ? thresholds : undefined,
      custom,
      displayName: calculationType ?? TIMESERIES_SAMPLE_LABEL,
      color: {
        mode: FieldColorModeId.Fixed,
        fixedColor: lineColor,
        seriesBy: 'min',
      },
    };

    valField.name = TIMESERIES_SAMPLE_LABEL;

    fields.push(valField); //on-top rendering (after constants)

    // Add forecast confidence bounds as a filled band
    if (forecastBounds) {
      // Build a time→value lookup for each bound
      const buildTimeMap = (boundFields: { time: Field<number>; values: Field<any> }) => {
        const map = new Map<number, number>();
        for (let i = 0; i < boundFields.time.values.length; i++) {
          map.set(boundFields.time.values[i], boundFields.values.values[i]);
        }
        return map;
      };

      const lowerMap = buildTimeMap(forecastBounds.lower);
      const upperMap = buildTimeMap(forecastBounds.upper);

      // Align bounds to the main time axis (null for timestamps without bound data)
      const lowerAligned: Array<number | null> = timeField.values.map((t) => lowerMap.get(t) ?? null);
      const upperAligned: Array<number | null> = timeField.values.map((t) => upperMap.get(t) ?? null);

      const boundsColor = lineColor;

      const boundsCustom: GraphFieldConfig = {
        lineWidth: 1,
        lineInterpolation: LineInterpolation.Smooth,
        pointSize: 0,
        fillOpacity: 0,
        lineStyle: { fill: 'dash', dash: [4, 4] },
        hideFrom: { legend: true, tooltip: false, viz: false },
      };

      // Lower bound field
      fields.push({
        name: FORECAST_LOWER_FIELD,
        values: lowerAligned as any,
        config: {
          displayName: 'lower bound',
          color: { mode: FieldColorModeId.Fixed, fixedColor: boundsColor },
          custom: { ...boundsCustom },
        },
        type: FieldType.number,
      });

      // Upper bound field — fillBelowTo creates the shaded band down to the lower bound
      fields.push({
        name: FORECAST_UPPER_FIELD,
        values: upperAligned as any,
        config: {
          displayName: 'upper bound',
          color: { mode: FieldColorModeId.Fixed, fixedColor: boundsColor },
          custom: {
            ...boundsCustom,
            fillBelowTo: FORECAST_LOWER_FIELD,
            fillOpacity: 10,
          },
        },
        type: FieldType.number,
      });
    }

    for (const f of fields) {
      if (f) {
        f.display = getDisplayProcessor({
          field: f,
          theme: theme,
        });
        f.config.decimals = decimals;
      }
    }

    const df = toDataFrame({
      name: dataFrameName,
      fields,
    });

    return [df];
  }, [
    calculationType,
    constants,
    dataFrameName,
    decimals,
    fill,
    forecastBounds,
    limits,
    lineColor,
    lineWidth,
    pointSize,
    theme,
    timeField,
    valueField,
  ]);

  const tweakAxis = React.useCallback(
    (opts: AxisPropsReflection, forField: Field) => {
      opts.formatValue = (value) => {
        return value == null ? '' : typeof value === 'number' ? toFixed(value, decimals) : `${value}`;
      };
      return opts;
    },
    [decimals]
  );

  const timeRangeFromData: TimeRange = React.useMemo(() => {
    const start = timeField?.values[0];
    const stop = timeField?.values[timeField?.values.length - 1];
    if (start == null || stop == null || start === stop) {
      return timeRange;
    }

    const raw = {
      from: dateTime(start),
      to: dateTime(stop),
    };
    return {
      from: raw.from,
      to: raw.to,
      raw: raw,
    };
  }, [timeField?.values, timeRange]);

  const annotations = React.useMemo(() => {
    const annArray = valueField?.config?.custom?.annotations;
    return isAnnotationEntityArray(annArray) ? annArray : undefined;
  }, [valueField?.config?.custom?.annotations]);

  if (!dataFrames) {
    return <Alert title="No Data" severity="warning" />;
  }

  return (
    <Wrapper onSeriesColorChange={onSeriesColorChange}>
      <TimeSeries
        width={width}
        height={height}
        frames={dataFrames}
        timeZone={timeZone}
        timeRange={timeRangeFromData}
        tweakAxis={tweakAxis}
        options={{}}
        legend={{
          showLegend: showLegend,
          calcs: [],
          displayMode: showLegend ? LegendDisplayMode.List : LegendDisplayMode.Hidden,
          placement: 'bottom',
        }}
      >
        {(config, alignedDataFrame) => {
          return (
            <>
              <TooltipPlugin
                frames={dataFrames}
                data={alignedDataFrame}
                config={config}
                mode={TooltipDisplayMode.Multi}
                timeZone={timeZone}
              />

              {annotations && <AnnotationsPlugin annotations={annotations} config={config} timeZone={timeZone} />}
            </>
          );
        }}
      </TimeSeries>
    </Wrapper>
  );
}

function Wrapper({
  children,
  onSeriesColorChange,
}: React.PropsWithChildren<{ onSeriesColorChange: Props['onSeriesColorChange'] }>) {
  const originalContext = usePanelContext();

  const customContext = React.useMemo(
    () => ({
      ...originalContext,
      onSeriesColorChange,
    }),
    [onSeriesColorChange, originalContext]
  );

  return <PanelContextProvider value={customContext}>{children}</PanelContextProvider>;
}

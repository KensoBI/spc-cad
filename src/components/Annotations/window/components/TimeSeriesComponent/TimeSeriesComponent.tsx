import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { css } from 'emotion';
import { SpcChart } from './SpcChart';
import { defaultTimeseriesSettings, TimeseriesSettings } from 'types/ViewComponentSettings';
import { defaults } from 'lodash';
import {
  useCurrentViewComponentIndexes,
  ViewComponentIds,
} from '../../settings/view-settings/EditedViewComponentProvider';
import { useFindViewComponentByIndexes, useSetViewComponent } from '../../settings/useUpdateAnnotationTemplate';
import { TemplateModel } from 'types/Annotation';
import { TIMESERIES_SAMPLE_LABEL } from 'constants/global';
import { CharacteristicAccessor } from 'types/CharacteristicData';

type Props = {
  featureModel: FeatureModelAnnotated;
  settings: TimeseriesSettings;
  viewComponentIds: ViewComponentIds;
  templateModel: TemplateModel;
};

export function TimeSeriesComponent({ featureModel, settings, viewComponentIds, templateModel }: Props) {
  const styles = useStyles2(getStyles);

  const settingsWithDefaults = React.useMemo(() => defaults(settings, defaultTimeseriesSettings), [settings]);

  const characteristicId = settingsWithDefaults.characteristicId;
  const constantsConfig = settingsWithDefaults.constantsConfig;
  const limitConfig = settingsWithDefaults.limitConfig;
  const lineWidth = settingsWithDefaults.lineWidth;
  const pointSize = settingsWithDefaults.pointSize;
  const fill = settingsWithDefaults.fill;
  const lineColor = settingsWithDefaults.lineColor as string;
  const showLegend = settingsWithDefaults.showLegend;
  const decimals = settingsWithDefaults.decimals;

  const characteristic = React.useMemo(
    () => featureModel.feature.characteristics[characteristicId],
    [characteristicId, featureModel.feature.characteristics]
  );

  const accessor = React.useMemo(
    () => (characteristic ? new CharacteristicAccessor(characteristic) : undefined),
    [characteristic]
  );

  const limits = React.useMemo(
    () => ({
      up:
        limitConfig?.up != null && accessor
          ? { value: accessor.get(limitConfig.up.name), color: limitConfig.up.color }
          : undefined,
      down:
        limitConfig?.down != null && accessor
          ? { value: accessor.get(limitConfig.down.name), color: limitConfig.down.color }
          : undefined,
    }),
    [accessor, limitConfig]
  );

  const constants = React.useMemo(() => {
    if (!accessor) {
      return undefined;
    }
    return constantsConfig
      ?.map((config) => ({
        title: config.title,
        value: accessor.get(config.name),
        color: config.color,
      }))
      ?.filter((c) => c.value != null);
  }, [accessor, constantsConfig]);

  const [containerRef, setContainerRef] = React.useState<HTMLElement | null>(null);

  const [height, setHeight] = React.useState<number | undefined>();
  const [width, setWidth] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (containerRef == null) {
      return;
    }

    const ro = new ResizeObserver((entry) => {
      const rect = entry?.[0]?.contentRect;
      if (rect) {
        setWidth(rect.width);
        setHeight(rect.height);
      }
    });
    ro.observe(containerRef);

    return () => {
      ro.disconnect();
    };
  }, [containerRef]);

  const viewComponentIndexes = useCurrentViewComponentIndexes(viewComponentIds, templateModel);
  const setViewComponent = useSetViewComponent(viewComponentIndexes, templateModel);
  const viewComponent = useFindViewComponentByIndexes(viewComponentIndexes, templateModel);
  const setSettings = React.useCallback(
    (newSettings: TimeseriesSettings) => {
      if (viewComponent) {
        setViewComponent({
          ...viewComponent,
          settings: { ...(viewComponent.settings ?? {}), timeseries: newSettings },
        });
      }
    },
    [setViewComponent, viewComponent]
  );
  const onSeriesColorChange = React.useCallback(
    (label: string, color: string) => {
      if (label === TIMESERIES_SAMPLE_LABEL) {
        setSettings({ ...settings, lineColor: color });
      }
      if (settings.constantsConfig != null) {
        for (const constant of settings.constantsConfig) {
          if (constant.name === label) {
            constant.color = color;
            setSettings({ ...settings });
            break;
          }
        }
      }
    },
    [setSettings, settings]
  );

  const timeseriesFields = React.useMemo(() => {
    return accessor?.getTimeseriesFields();
  }, [accessor]);

  return (
    <div ref={setContainerRef} className={`timeseries-container ${styles.container}`}>
      {width && height ? (
        <SpcChart
          dataFrameName={characteristicId}
          timeField={timeseriesFields?.time}
          valueField={timeseriesFields?.values}
          calculationType={featureModel.feature.meta?.calculationType}
          limits={limits}
          constants={constants}
          lineWidth={lineWidth}
          pointSize={pointSize}
          fill={fill}
          width={width}
          height={height}
          lineColor={lineColor}
          showLegend={showLegend}
          decimals={decimals}
          onSeriesColorChange={onSeriesColorChange}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      padding: 10px;
      height: 100%;
    `,
  };
};

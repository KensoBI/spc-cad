import { Field, Select, useStyles2 } from '@grafana/ui';
import { defaults, sortBy } from 'lodash';
import React from 'react';
import { useAvailableColumns } from 'templates/TemplateModelsProvider';
import { defaultTimeseriesSettings, TimeseriesSettings, ViewComponent } from 'types/ViewComponentSettings';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from 'emotion';
import { ConstantsList } from './ConstrantsList';
import { Thresholds } from './Thresholds';
import { TimeSeriesSimpleParams } from './TimeSeriesSimpleParams';
import { devLog } from 'utils/devLogger';

type Props = {
  viewComponent: ViewComponent;
  setViewComponent: (value: ViewComponent) => void;
};

export function TimeSeriesComponentEditor({ viewComponent, setViewComponent }: Props) {
  const styles = useStyles2(getStyles);
  const availableColumns = useAvailableColumns();

  const characteristicOptions = React.useMemo(() => {
    const options = sortBy(Object.entries(availableColumns), ([_, char]) => char.displayName).map(([chId, char]) => ({
      value: chId,
      label: char.displayName,
    }));

    devLog.log('📋 TimeSeriesComponentEditor:', {
      availableColumns,
      characteristicOptions: options,
      currentSettings: viewComponent?.settings?.timeseries,
    });

    return options;
  }, [availableColumns, viewComponent?.settings?.timeseries]);

  const settings = React.useMemo(() => {
    const s = viewComponent?.settings?.timeseries;
    return s != null ? defaults(s, defaultTimeseriesSettings) : defaultTimeseriesSettings;
  }, [viewComponent?.settings?.timeseries]);

  const setSettings = React.useCallback(
    (newSettings: TimeseriesSettings) => {
      devLog.log('💾 TimeSeriesComponentEditor: Saving settings', {
        oldSettings: viewComponent?.settings?.timeseries,
        newSettings,
      });
      setViewComponent({ ...viewComponent, settings: { ...(viewComponent.settings ?? {}), timeseries: newSettings } });
    },
    [setViewComponent, viewComponent]
  );

  const availableFields = React.useMemo(() => {
    const char = availableColumns?.[settings.characteristicId];
    return [...(char?.columns ?? [])];
  }, [availableColumns, settings.characteristicId]);


  //todo fix depiicated warning for Select
  //todo. We need to set characteristic ID here not name
  return (
    <div className={styles.container}>
      <Field label="Characteristic">
        <Select
          value={settings.characteristicId}
          width={10}
          options={characteristicOptions}
          placeholder=""
          onChange={(newValue) => {
            devLog.log('🔄 Characteristic changed:', { oldValue: settings.characteristicId, newValue });
            if (newValue.value != null) {
              setSettings({ ...settings, characteristicId: newValue.value });
            }
          }}
          allowCustomValue
        />
      </Field>
      <ConstantsList availableFields={availableFields} setSettings={setSettings} settings={settings} />
      <Thresholds availableFields={availableFields} setSettings={setSettings} settings={settings} />
      <TimeSeriesSimpleParams setSettings={setSettings} settings={settings} />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      border-top: 1px solid ${theme.colors.primary.border};
      margin: ${theme.spacing(0.5, 2)};
      padding-top: ${theme.spacing(1)};
    `,
  };
};

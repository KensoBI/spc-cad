import React from 'react';
import { LimitConfig, LimitConfigItem, TimeseriesSettings } from 'types/ViewComponentSettings';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from 'emotion';
import { InlineField, Select, useStyles2 } from '@grafana/ui';
import { InlineColorField } from '../../../../../InlineColorField';

const defaultColor = 'rgb(196, 22, 42)';

type Props = {
  availableFields: string[];
  settings: TimeseriesSettings;
  setSettings: (value: TimeseriesSettings) => void;
};

export function Thresholds({ availableFields, settings, setSettings }: Props) {
  const styles = useStyles2(getStyles);

  const options = React.useMemo(() => {
    return availableFields.map((fieldName) => ({
      value: fieldName,
      label: fieldName,
    }));
  }, [availableFields]);

  const setLimitConfig = (key: keyof NonNullable<LimitConfig>, item: LimitConfigItem | undefined) => {
    setSettings({
      ...settings,
      limitConfig: {
        ...(settings.limitConfig ?? {}),
        [key]: item,
      },
    });
  };

  const setName = (key: keyof NonNullable<LimitConfig>, name: string | undefined) => {
    const item: LimitConfigItem | undefined =
      name != null
        ? {
            color:
              settings.limitConfig?.[key] != null
                ? settings.limitConfig[key]?.color ?? defaultColor
                : settings.constantsConfig?.find((c) => c.name === name)?.color ?? defaultColor,
            name,
          }
        : undefined;

    setLimitConfig(key, item);
  };

  const setColor = (key: keyof NonNullable<LimitConfig>, color: string) => {
    const name = settings.limitConfig?.[key]?.name;
    if (name != null) {
      setLimitConfig(key, {
        name,
        color,
      });
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.row}>
          <InlineField label={'Upper threshold'}>
            <Select
              options={options}
              value={settings.limitConfig?.up?.name}
              isClearable
              onChange={(selected) => {
                setName('up', selected?.value);
              }}
              width={15}
            />
          </InlineField>

          {settings.limitConfig?.up && (
            <InlineColorField
              color={settings.limitConfig?.up?.color ?? defaultColor}
              onChange={(color) => {
                setColor('up', color);
              }}
            />
          )}
        </div>
        <div className={styles.row}>
          <InlineField label={'Lower threshold'}>
            <Select
              options={options}
              value={settings.limitConfig?.down?.name}
              isClearable
              onChange={(selected) => {
                setName('down', selected?.value);
              }}
              width={15}
            />
          </InlineField>
          {settings.limitConfig?.down && (
            <InlineColorField
              color={settings.limitConfig?.down?.color ?? defaultColor}
              onChange={(color) => {
                setColor('down', color);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background-color: ${theme.colors.background.canvas};
      padding: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius(2)};
      margin-top: ${theme.spacing(1)};
    `,
    row: css`
      display: flex;
    `,
  };
};

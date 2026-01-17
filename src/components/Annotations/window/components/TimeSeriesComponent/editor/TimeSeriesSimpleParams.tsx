import React from 'react';
import { defaultTimeseriesSettingsColor, TimeseriesSettings } from 'types/ViewComponentSettings';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from 'emotion';
import { InlineField, InlineSwitch, Input, Select, useStyles2 } from '@grafana/ui';
import { InlineColorField } from 'components/InlineColorField';
import { toNumber } from 'lodash';

type Props = {
  settings: TimeseriesSettings;
  setSettings: (value: TimeseriesSettings) => void;
};

const selectableValues = <T extends string | number>(vector: T[]) =>
  vector.map((el) => ({
    value: el,
    label: `${el}`,
  }));

const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const options_0 = selectableValues([0, ...base]);
const options_05 = selectableValues([0.5, ...base]);

export function TimeSeriesSimpleParams({ settings, setSettings }: Props) {
  const styles = useStyles2(getStyles);
  return (
    <>
      <div className={styles.container}>
        <div className={styles.row}>
          <InlineField label={'Fill'} className={styles.noMargin}>
            <Select
              width={8}
              options={options_0}
              value={settings.fill}
              onChange={(selected) => {
                if (selected?.value != null) {
                  setSettings({ ...settings, fill: selected.value });
                }
              }}
            />
          </InlineField>
          <InlineField label={'Line Width'} className={styles.noMargin}>
            <Select
              width={8}
              options={options_0}
              value={settings.lineWidth}
              onChange={(selected) => {
                if (selected?.value != null) {
                  setSettings({ ...settings, lineWidth: selected.value });
                }
              }}
            />
          </InlineField>
          <InlineField label={'Point Radius'} className={styles.noMargin}>
            <Select
              width={8}
              options={options_05}
              value={settings.pointSize}
              onChange={(selected) => {
                if (selected?.value != null) {
                  setSettings({ ...settings, pointSize: selected.value });
                }
              }}
            />
          </InlineField>
        </div>
        <div className={styles.rowNotFirst}>
          <InlineSwitch
            label="View legend"
            showLabel={true}
            value={settings.showLegend}
            onChange={(e) => setSettings({ ...settings, showLegend: e.currentTarget.checked })}
          />
          <InlineField label={'Decimals'} className={styles.noMargin} grow>
            <Input
              value={settings.decimals ?? ''}
              onChange={(e) => {
                let number = toNumber(e.currentTarget.value);
                const decimals =
                  e.currentTarget.value === '' || isNaN(number) ? undefined : Math.min(Math.max(number, 0), 6);
                setSettings({ ...settings, decimals });
              }}
              type="number"
              min={0}
              max={6}
              onFocus={(e) => e.currentTarget.select()}
              placeholder="Decimal places"
            />
          </InlineField>
          <div>
            <InlineColorField
              label="Line color"
              color={settings.lineColor ?? defaultTimeseriesSettingsColor}
              onChange={(color) => {
                setSettings({ ...settings, lineColor: color });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  const row = css`
    display: flex;
    gap: ${theme.spacing(1)};
  `;
  return {
    container: css`
      background-color: ${theme.colors.background.canvas};
      padding: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius(2)};
      margin-top: ${theme.spacing(1)};
    `,
    row,
    rowNotFirst: css`
      ${row};
      margin-top: ${theme.spacing(1)};
    `,
    noMargin: css`
      margin: 0;
    `,
  };
};

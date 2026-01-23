import { Button, InlineField, Input, RadioButtonGroup, Select, Tab, TabsBar, useStyles2 } from '@grafana/ui';
import React from 'react';
import { css } from 'emotion';
import { GrafanaTheme2 } from '@grafana/data';
import { GridCell } from 'types/ViewComponentSettings';
import { useAvailableColumns } from 'templates/TemplateModelsProvider';
import { sortBy, toNumber } from 'lodash';
import { CellColorMapping } from './CellColorMapping';
import { LinkSettings } from 'types/Annotation';
import { LinkSettingsComponent } from 'components/Annotations/window/LinkSettingsComponent';

type Props = {
  setCell: (n: GridCell) => void;
  cell: GridCell;
};

const STATIC_VALUE = 'STATIC';
const DYNAMIC_VALUE = 'DYNAMIC';

const staticDynamicOptions = [
  { label: 'Text', value: STATIC_VALUE, icon: 'pen' },
  { label: 'Control', value: DYNAMIC_VALUE, icon: 'download-alt' },
];

type Tabs = 'basic' | 'styling' | 'display';

type TabInfo = { label: string; value: Tabs };

const tabs: TabInfo[] = [
  { label: 'Basic', value: 'basic' },
  { label: 'Styling', value: 'styling' },
  { label: 'Display', value: 'display' },
];

export function CellSettings({ cell, setCell }: Props) {
  const styles = useStyles2(getStyles);
  const [tab, setTab] = React.useState<Tabs>('basic');

  const setLink = React.useCallback(
    (link?: LinkSettings) => {
      setCell({
        ...cell,
        link,
      });
    },
    [cell, setCell]
  );

  return (
    <div className={styles.container}>
      <TabsBar className={styles.tabBar}>
        {tabs.map(({ label, value }) => (
          <Tab key={value} label={label} active={tab === value} onChangeTab={() => setTab(value)} />
        ))}
      </TabsBar>

      {tab === 'basic' ? (
        <div>
          <div>
            <InlineField label="Name" grow className={styles.nameField}>
              <Input
                value={cell.name}
                placeholder="Name"
                onChange={(e) => setCell({ ...cell, name: e.currentTarget.value })}
              />
            </InlineField>
          </div>
          <div className={styles.valueRow}>
            {cell.staticText ? (
              <InlineField label="Static text">
                <Input
                  value={cell.value.static}
                  placeholder="Static text"
                  onChange={(e) => setCell({ ...cell, value: { ...cell.value, static: e.currentTarget.value } })}
                />
              </InlineField>
            ) : (
              <CheracteristicSelectors cell={cell} setCell={setCell} />
            )}
            <div>
              <RadioButtonGroup
                options={staticDynamicOptions}
                value={cell.staticText ? STATIC_VALUE : DYNAMIC_VALUE}
                onChange={(v) => setCell({ ...cell, staticText: v === STATIC_VALUE })}
                fullWidth
              />
            </div>
          </div>
        </div>
      ) : tab === 'styling' ? (
        <div>
          <h6>Conditional styling</h6>
          <CellColorMapping key={cell.id} cell={cell} setCell={setCell} />
        </div>
      ) : (
        <div>
          <div>
            <LinkSettingsComponent link={cell.link} setLink={setLink} />
          </div>

          <div className={styles.row}>
            <InlineField label="Suffix" grow>
              <Input
                value={cell.suffix ?? ''}
                placeholder="Suffix"
                onChange={(e) =>
                  setCell({
                    ...cell,
                    suffix: e.currentTarget.value,
                  })
                }
                suffix={
                  cell.suffix ? (
                    <Button
                      onClick={() => setCell({ ...cell, suffix: undefined })}
                      icon="times"
                      aria-label="Clear suffix"
                      variant="secondary"
                      size="sm"
                      fill="text"
                    />
                  ) : (
                    <></>
                  )
                }
              />
            </InlineField>
          </div>
          <div className={styles.row}>
            <InlineField label={'Decimals'} tooltip="If the value is not a number, the setting will not be used." grow>
              <Input
                value={cell.formatters?.number?.decimals ?? ''}
                onChange={(e) => {
                  let number = toNumber(e.currentTarget.value);
                  const decimals =
                    e.currentTarget.value === '' || isNaN(number) ? undefined : Math.min(Math.max(number, 0), 6);
                  setCell({
                    ...cell,
                    formatters: {
                      ...(cell.formatters ?? {}),
                      number: {
                        decimals,
                      },
                    },
                  });
                }}
                type="number"
                min={0}
                max={6}
                onFocus={(e) => e.currentTarget.select()}
                placeholder="Decimal places"
              />
            </InlineField>
          </div>
        </div>
      )}
    </div>
  );
}

type CharacteristicSelectorsProps = {
  setCell: (n: GridCell) => void;
  cell: GridCell;
};

function CheracteristicSelectors({ cell, setCell }: CharacteristicSelectorsProps) {
  const availableColumns = useAvailableColumns();

  const characteristicOptions = React.useMemo(() => {
    return sortBy(Object.entries(availableColumns), ([_, char]) => char.displayName).map(([chId, char]) => ({
      value: chId,
      label: char.displayName,
    }));
  }, [availableColumns]);

  const columnOptions = React.useMemo(() => {
    if (cell.value.dynamic?.characteristic_id == null) {
      return [];
    }
    const char = availableColumns?.[cell.value.dynamic.characteristic_id];
    return [...(char?.columns ?? [])].map((key) => ({
      value: key,
      label: key,
    }));
  }, [availableColumns, cell.value.dynamic?.characteristic_id]);

  const setValues = (characteristic_id?: string, column?: string) => {
    setCell({
      ...cell,
      value: {
        ...cell.value,
        dynamic: {
          characteristic_id: characteristic_id ?? cell.value.dynamic?.characteristic_id ?? '',
          column: column ?? cell.value.dynamic?.column ?? '',
        },
      },
    });
  };

  return (
    <div>
      <InlineField label="Characteristic" grow>
        <Select
          value={cell.value.dynamic?.characteristic_id}
          options={characteristicOptions}
          placeholder=""
          onChange={(newValue) => {
            if (newValue.value != null) {
              setValues(newValue.value);
            }
          }}
          allowCustomValue
        />
      </InlineField>
      <InlineField label="Column" grow>
        <Select
          value={cell.value.dynamic?.column}
          options={columnOptions}
          placeholder=""
          onChange={(newValue) => {
            if (newValue.value != null) {
              setValues(undefined, newValue.value);
            }
          }}
          allowCustomValue
          noOptionsMessage={'Select a Control'}
        />
      </InlineField>
    </div>
  );
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css``,
    nameField: css`
      margin-right: 0;
    `,
    tabBar: css`
      margin-bottom: ${theme.spacing(1)};
    `,
    valueRow: css`
      margin-top: ${theme.spacing(1)};
      padding-top: ${theme.spacing(1)};
      border-top: 1px solid ${theme.colors.primary.transparent};
      margin-bottom: ${theme.spacing(1)};
      padding-bottom: ${theme.spacing(1)};
      border-bottom: 1px solid ${theme.colors.primary.transparent};
      display: flex;

      & > :first-child {
        flex: 1;
      }
    `,
    row: css`
      display: flex;
    `,
  };
};

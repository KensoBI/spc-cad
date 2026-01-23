import { Field, InlineField, Input, Select, useStyles2 } from '@grafana/ui';
import { sortBy, toNumber } from 'lodash';
import React from 'react';
import { useAvailableColumns } from 'templates/TemplateModelsProvider';
import { defaultTableSettings, TableSettings, ViewComponent } from 'types/ViewComponentSettings';
import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { css } from 'emotion';

type Props = {
  viewComponent: ViewComponent;
  setViewComponent: (value: ViewComponent) => void;
};

export function TableComponentEditor({ viewComponent, setViewComponent }: Props) {
  const styles = useStyles2(getStyles);
  const characteristics = useAvailableColumns();

  const characteristicRowsOptions = React.useMemo(() => {
    return sortBy(Object.entries(characteristics), ([_, char]) => char.displayName).map(([chId, char]) => ({
      value: chId,
      label: char.displayName,
    }));
  }, [characteristics]);

  const characteristicColumnsOptions = React.useMemo(() => {
    const set = new Set<string>();
    Object.values(characteristics).forEach((char) => {
      char.columns.forEach((column: string) => set.add(column));
    });
    return sortBy([...set]).map((ch) => ({
      value: ch,
      label: ch,
    }));
  }, [characteristics]);

  const settings = React.useMemo(() => {
    return viewComponent?.settings?.table ?? defaultTableSettings;
  }, [viewComponent?.settings?.table]);

  const setSettings = React.useCallback(
    (newSettings: TableSettings) => {
      setViewComponent({ ...viewComponent, settings: { ...(viewComponent.settings ?? {}), table: newSettings } });
    },
    [setViewComponent, viewComponent]
  );

  return (
    <div className={styles.container}>
      <Multiselect
        settings={settings}
        setSettings={setSettings}
        label="Columns"
        emptyInfo="All columns"
        options={characteristicColumnsOptions}
        propertyName="columns"
      />
      <Multiselect
        settings={settings}
        setSettings={setSettings}
        label="Rows"
        emptyInfo="All rows"
        options={characteristicRowsOptions}
        propertyName="rows"
      />
      <InlineField label={'Decimals'} grow>
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
    </div>
  );
}

type MultiselectProps = {
  settings: TableSettings;
  setSettings: (n: TableSettings) => void;
  propertyName: 'columns' | 'rows';
  label: string;
  emptyInfo: string;
  options: Array<SelectableValue<string>> | undefined;
};

function Multiselect({ settings, setSettings, propertyName, label, emptyInfo, options }: MultiselectProps) {
  const value = settings[propertyName];
  return (
    <Field label={label}>
      <Select
        value={value}
        options={options}
        placeholder={value == null ? emptyInfo : ''}
        onChange={(selectable) => {
          const selectedValues = Array.isArray(selectable)
            ? selectable.map((el) => el.value as string)
            : selectable?.value != null
            ? [selectable.value]
            : [];

          setSettings({
            ...settings,
            [propertyName]: selectedValues.length > 0 ? selectedValues : undefined,
          });
        }}
        allowCustomValue
        isMulti
        isClearable
      />
    </Field>
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

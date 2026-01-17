import { MutableDataFrame, FieldType, applyFieldOverrides } from '@grafana/data';
import { Table, useTheme2 } from '@grafana/ui';
import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { defaultTableSettings, TableSettings } from 'types/ViewComponentSettings';
import { useWindowSize } from '../../../container/Windows';

type Props = { featureModel: FeatureModelAnnotated; settings: TableSettings };

export function TableComponent({ featureModel, settings }: Props) {
  const { width } = useWindowSize();
  const theme = useTheme2();

  const visibleColumn = React.useMemo(() => {
    const columnSet = settings.columns != null ? new Set<string>(settings.columns) : undefined;
    const checkColumn = (name: string) => columnSet?.has(name) ?? true;
    return checkColumn;
  }, [settings.columns]);

  const visibleRow = React.useMemo(() => {
    const rowSet = settings.rows != null ? new Set<string>(settings.rows) : undefined;
    const checkRow = (name: string) => rowSet?.has(name) ?? true;
    return checkRow;
  }, [settings.rows]);

  const dataFrame = React.useMemo(() => {
    const dataColumns = new Set<string>();
    for (const ch in featureModel.feature.characteristics) {
      for (const dataKey in featureModel.feature.characteristics[ch].table) {
        if (visibleColumn(dataKey)) {
          dataColumns.add(dataKey);
        }
      }
    }

    const dataColumnsArray = [...dataColumns];

    const fields = [
      { name: 'control', type: FieldType.string, values: [] },
      ...dataColumnsArray.map((characteristic) => ({
        name: characteristic,
        type: FieldType.number,
        values: [],
      })),
    ];
    const data = new MutableDataFrame({
      fields,
    });

    for (const control in featureModel.feature.characteristics) {
      if (!visibleRow(control)) {
        continue;
      }
      const row = [control];
      const rowData = featureModel.feature.characteristics[control];
      for (const columnKey of dataColumnsArray) {
        const value = rowData?.table?.[columnKey];
        row.push(!isNaN(value) ? value : '');
      }
      data.appendRow(row);
    }

    const frame = applyFieldOverrides({
      data: [data],
      fieldConfig: {
        overrides: [],
        defaults: {
          decimals: settings.decimals ?? defaultTableSettings.decimals,
        },
      },
      theme,
      replaceVariables: (value: string) => value,
    })[0];

    return frame;
  }, [featureModel.feature.characteristics, settings.decimals, theme, visibleColumn, visibleRow]);

  return (
    <div>
      <Table columnMinWidth={50} width={width - 8} height={(dataFrame.length + 1) * 36} data={dataFrame} />
    </div>
  );
}

import { MutableDataFrame, FieldType, applyFieldOverrides } from '@grafana/data';
import { Table, useTheme2 } from '@grafana/ui';
import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { defaultTableSettings, TableSettings } from 'types/ViewComponentSettings';
import { useWindowSize } from '../../../container/Windows';
import { CharacteristicAccessor } from 'types/CharacteristicData';

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
    // Collect all unique columns across all characteristics
    const dataColumns = new Set<string>();
    const controlsArray = Object.keys(featureModel.feature.characteristics);

    for (const control of controlsArray) {
      const charData = featureModel.feature.characteristics[control];
      const accessor = new CharacteristicAccessor(charData);
      const columns = accessor.getColumns();

      for (const columnName of columns) {
        if (visibleColumn(columnName)) {
          dataColumns.add(columnName);
        }
      }
    }

    const dataColumnsArray = [...dataColumns];

    // Build fields for each column
    const fields = [
      {
        name: 'control',
        type: FieldType.string,
        values: controlsArray.filter(visibleRow),
        config: {},
      },
      ...dataColumnsArray.map((columnKey) => ({
        name: columnKey,
        type: FieldType.number,
        values: controlsArray
          .filter(visibleRow)
          .map((control) => {
            const charData = featureModel.feature.characteristics[control];
            const accessor = new CharacteristicAccessor(charData);
            const value = accessor.get(columnKey);
            return !isNaN(value) ? value : '';
          }),
        config: {},
      })),
    ];

    const data = new MutableDataFrame({ fields });

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

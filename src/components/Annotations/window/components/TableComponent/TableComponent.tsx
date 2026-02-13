import { MutableDataFrame, FieldType, applyFieldOverrides } from '@grafana/data';
import { Table, useTheme2 } from '@grafana/ui';
import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { defaultTableSettings, TableSettings } from 'types/ViewComponentSettings';
import { useWindowSize } from '../../../container/Windows';
import { CharacteristicAccessor } from 'types/CharacteristicData';
import { usePanelProps } from 'utils/PanelPropsProvider';

type Props = { featureModel: FeatureModelAnnotated; settings: TableSettings };

export function TableComponent({ featureModel, settings }: Props) {
  const { width } = useWindowSize();
  const theme = useTheme2();
  const { timeZone } = usePanelProps();

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
    const characteristicsArray = Object.values(featureModel.feature.characteristics);

    // Build array with displayName for each characteristic
    const characteristicsWithDisplayName = characteristicsArray.map((charData) => {
      const accessor = new CharacteristicAccessor(charData);
      return {
        charData,
        displayName: accessor.getDisplayName() || '',
      };
    });

    for (const { charData } of characteristicsWithDisplayName) {
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
        name: 'characteristic',
        type: FieldType.string,
        values: characteristicsWithDisplayName
          .filter(({ displayName }) => visibleRow(displayName))
          .map(({ displayName }) => displayName),
        config: {},
      },
      ...dataColumnsArray.map((columnKey) => {
        // Detect the original field type from the first characteristic that has this column
        let fieldType = FieldType.number;
        for (const { charData } of characteristicsWithDisplayName) {
          const accessor = new CharacteristicAccessor(charData);
          const field = accessor.getField(columnKey);
          if (field) {
            fieldType = field.type;
            break;
          }
        }

        return {
          name: columnKey,
          type: fieldType,
          values: characteristicsWithDisplayName
            .filter(({ displayName }) => visibleRow(displayName))
            .map(({ charData }) => {
              const accessor = new CharacteristicAccessor(charData);
              const value = accessor.get(columnKey);
              return !isNaN(value) ? value : '';
            }),
          config: {},
        };
      }),
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
      timeZone,
      replaceVariables: (value: string) => value,
    })[0];

    return frame;
  }, [featureModel.feature.characteristics, settings.decimals, theme, timeZone, visibleColumn, visibleRow]);

  return (
    <div>
      <Table columnMinWidth={50} width={width - 8} height={(dataFrame.length + 1) * 36} data={dataFrame} />
    </div>
  );
}

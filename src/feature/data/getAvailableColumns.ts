import { Dictionary } from 'lodash';
import { FeatureModel } from 'types/AnnotationModel';
import { CharacteristicAccessor } from 'types/CharacteristicData';

export type AvailableCharacteristic = {
  columns: Set<string>;
  displayName: string;
};

export function getAvailableColumns(featureModels: FeatureModel[]) {
  const characteristics: Dictionary<AvailableCharacteristic> = {};
  for (const model of featureModels) {
    for (const chId of Object.keys(model.feature.characteristics)) {
      const charData = model.feature.characteristics[chId];
      const accessor = new CharacteristicAccessor(charData);

      if (!(chId in characteristics)) {
        characteristics[chId] = {
          columns: new Set(),
          displayName: accessor.getDisplayName() || chId,
        };
      }

      const columns = accessor.getColumns();
      for (const columnName of columns) {
        characteristics[chId].columns.add(columnName);
      }
    }
  }
  return characteristics;
}

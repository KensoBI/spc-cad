import { Dictionary } from 'lodash';
import { FeatureModel } from 'types/AnnotationModel';
import { CharacteristicAccessor } from 'types/CharacteristicData';

export function getAvailableColumns(featureModels: FeatureModel[]) {
  const characteristics: Dictionary<Set<string>> = {};
  for (const model of featureModels) {
    for (const chName of Object.keys(model.feature.characteristics)) {
      if (!(chName in characteristics)) {
        characteristics[chName] = new Set();
      }

      const characteristicSet = characteristics[chName];
      const charData = model.feature.characteristics[chName];

      // NEW: Use accessor to get columns
      const accessor = new CharacteristicAccessor(charData);
      const columns = accessor.getColumns();

      for (const columnName of columns) {
        characteristicSet.add(columnName);
      }
    }
  }
  return characteristics;
}

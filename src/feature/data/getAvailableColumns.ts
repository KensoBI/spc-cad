import { Dictionary } from 'lodash';
import { FeatureModel } from 'types/AnnotationModel';
import { CharacteristicAccessor } from 'types/CharacteristicData';

export function getAvailableColumns(featureModels: FeatureModel[]) {
  const characteristics: Dictionary<Set<string>> = {};
  for (const model of featureModels) {
    for (const chName of Object.keys(model.feature.characteristics)) {
      const charData = model.feature.characteristics[chName];

      if(!charData.displayName){
          return characteristics;
      }
      
      if (!(chName in characteristics)) {
        characteristics[charData.displayName] = new Set();
      }

      const characteristicSet = characteristics[charData.displayName];
      

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


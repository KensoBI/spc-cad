import { Dictionary } from "lodash";
import { FeatureModel } from "types/AnnotationModel";

export function getAvailableColumns(featureModels: FeatureModel[]) {
    const characteristics: Dictionary<Set<string>> = {}
    for(const model of featureModels) {
        for(const chName of Object.keys(model.feature.characteristics)) {
            if(chName in characteristics !== true) {
                characteristics[chName] = new Set()
            }
            const characteristicSet = characteristics[chName]
            const table = model.feature.characteristics?.[chName]?.table
            if(table) {
                const tableKeys = Object.keys(model.feature.characteristics[chName].table);
                for(const valueName of tableKeys) {
                    characteristicSet.add(valueName)
                }
            }else {
                console.warn("getAvailableColumns - Table is null", model.feature.characteristics)
            }
        }
    }
    return characteristics;
}

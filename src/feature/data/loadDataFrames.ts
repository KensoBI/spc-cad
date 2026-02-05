import { DataFrame, Field } from '@grafana/data';
import { Dictionary, keyBy } from 'lodash';
import { CadDsEntity, ScanItem } from 'types/CadSettings';
import { Feature } from 'types/Feature';

type ColumnsDict = {
  feature?: Field;
  characteristic_id?: Field;
  characteristic_name?: Field;
  nominal?: Field;
  partid?: Field;
  featuretype?: Field;
} & {
  [key: string]: Field;
};
const metaColumns = ['feature', 'characteristic_id', 'characteristic_name', 'partid', 'featuretype'];

export class MappedFeatures extends Map<string, Feature> {
  getOrDefault = (featureName: string, partId: string, featureType: string, refId: string) => {
    const key = featureName;
    if (this.has(key)) {
      return this.get(key) as Feature;
    }
    const newFeature: Feature = {
      uid: '',
      id: key,
      partId: partId?.toString() ?? '',
      refId: refId,
      name: '',
      type: featureType ?? 'generic',
      position: undefined,
      positionMode: 'undefined',
      characteristics: {},
    };
    this.set(key, newFeature);
    return newFeature;
  };
}

export function loadFeaturesByControl(
  fields: Field[],
  refId: string,
  mappedFeatures: MappedFeatures,
  dataFrame: DataFrame
) {
  const columns: ColumnsDict = keyBy(fields, (column) => column.name.toLowerCase());

  if (!columns.feature || !columns.characteristic_id || !columns.nominal) {
    return;
  }

  // Create field map once for this DataFrame
  const fieldMap = new Map<string, number>();
  fields.forEach((field, index) => {
    const name = field.name.toLowerCase();
    if (!metaColumns.includes(name)) {
      fieldMap.set(name, index);
    }
  });

  const length = columns.feature.values.length;
  //assert that fields.every(field => field.values.length === length) is true

  for (let i = 0; i < length; i++) {
    const featureName = columns.feature.values[i];
    const characteristicId = columns.characteristic_id.values[i];
    const characteristicName = columns.characteristic_name?.values[i];
    const partId = columns.partid?.values[i];
    const featureType = columns.featuretype?.values[i];

    const feature = mappedFeatures.getOrDefault(featureName, partId, featureType, refId);

    if (characteristicId) {
      // Store DataFrame reference instead of copying data
      const charData = {
        dataFrame,
        rowIndex: i,
        fieldMap,
        displayName: characteristicName || characteristicId.toString(),
      };

      // Store ONLY by characteristic_id (single source of truth - no duplicates)
      feature.characteristics[`${characteristicId}`] = charData;
    }
  }
}

export function loadTimeseries(
  fields: Field[],
  refId: string,
  mappedFeatures: MappedFeatures,
  dataFrame: DataFrame,
  meta?: Dictionary<any>
) {
  const columns: ColumnsDict = keyBy(fields, (column) => column.name.toLowerCase());

  if (!columns.time || !columns.characteristic_id || !columns.value) {
    return;
  }

  const length = columns.time.values.length;

  // Find field indices once
  const timeFieldIndex = fields.findIndex((f) => f.name.toLowerCase() === 'time');
  const valueFieldIndex = fields.findIndex((f) => f.name.toLowerCase() === 'value');

  if (timeFieldIndex === -1 || valueFieldIndex === -1) {
    return;
  }

  // Build map of characteristic_id → row indices (instead of copied arrays)
  const rowIndicesMap = new Map<string, number[]>();

  for (let i = 0; i < length; i++) {
    const characteristicId = columns.characteristic_id.values[i];

    if (characteristicId == null) {
      continue;
    }

    const key = `${characteristicId}`;
    if (!rowIndicesMap.has(key)) {
      rowIndicesMap.set(key, []);
    }
    rowIndicesMap.get(key)!.push(i); // Store row index, not data
  }

  // Build set of all characteristic IDs that exist across all loaded features
  const loadedCharacteristicIds = new Set<string>();
  for (const feature of mappedFeatures.values()) {
    for (const charId of Object.keys(feature.characteristics)) {
      loadedCharacteristicIds.add(charId);
    }
  }

  // Apply timeseries data to characteristics that exist in loaded features
  const matchedIds = new Set<string>();
  const timeseriesIds = Array.from(rowIndicesMap.keys());

  for (const feature of mappedFeatures.values()) {
    for (const [characteristicId, rowIndices] of rowIndicesMap) {
      if (feature.characteristics[characteristicId]) {
        // Add timeseries to existing characteristic
        feature.characteristics[characteristicId] = {
          ...feature.characteristics[characteristicId],
          timeseries: {
            dataFrame,
            timeFieldIndex,
            valueFieldIndex,
            rowIndices,
          },
        };
        matchedIds.add(characteristicId);

        if (meta != null && Object.keys(meta).length > 0) {
          feature.meta = { ...(feature.meta ?? {}), ...meta };
        }
      }
    }
  }
}

export function loadCadLinks(fields: Field[], refId: string) {
  const linksField = fields.find((field) => field.name === 'links');
  if (linksField == null) {
    return [];
  }

  const colorsField = fields.find((field) => field.name === 'colors');
  if (colorsField == null) {
    return [];
  }
  if (colorsField.values.length !== linksField.values.length) {
    return [];
  }

  const cadEntities: CadDsEntity[] = [];
  for (let i = 0; i < colorsField.values.length; i++) {
    const link = linksField.values[i];
    if (typeof link !== 'string' || link === '') {
      continue;
    }
    cadEntities.push({
      color: colorsField.values[i],
      path: link,
    });
  }

  return cadEntities;
}

export function loadScanLinks(fields: Field[], refId: string) {
  const linksField = fields.find((field) => field.name === 'links');
  if (linksField == null) {
    return [];
  }

  const timesField = fields.find((field) => field.name === 'times');
  if (timesField == null) {
    return [];
  }
  if (timesField.values.length !== linksField.values.length) {
    return [];
  }

  const scanItems: ScanItem[] = [];
  for (let i = 0; i < linksField.values.length; i++) {
    const link = linksField.values[i];
    if (typeof link !== 'string' || link === '') {
      continue;
    }
    const time = timesField.values[i];
    if (typeof time !== 'string' || time === '') {
      continue;
    }

    try {
      scanItems.push({
        link,
        time: new Date(time), //"time" field has format: 2006-01-02T15:04:05Z
      });
    } catch (e) {
      continue;
    }
  }

  return scanItems;
}

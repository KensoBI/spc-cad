import { DataFrame, Field } from '@grafana/data';
import { Dictionary, keyBy } from 'lodash';
import { CadDsEntity, ScanItem } from 'types/CadSettings';
import { Feature } from 'types/Feature';
import { devLog } from 'utils/devLogger';

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
    console.warn('alert-danger', [`Feature or Characteristic_id or Nominal column is missing in query ${refId}.`]);
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
    console.warn('alert-danger', [`Time or Characteristic_id or Value column is missing in timeseries query ${refId}.`]);
    return;
  }

  const length = columns.time.values.length;

  // Find field indices once
  const timeFieldIndex = fields.findIndex((f) => f.name.toLowerCase() === 'time');
  const valueFieldIndex = fields.findIndex((f) => f.name.toLowerCase() === 'value');

  if (timeFieldIndex === -1 || valueFieldIndex === -1) {
    console.warn('alert-danger', [`Time or Value field not found in ${refId}.`]);
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

  const unmatchedIds = timeseriesIds.filter(id => !matchedIds.has(id));
  const unmatchedMeasurementCount = unmatchedIds.reduce((sum, id) => sum + (rowIndicesMap.get(id)?.length ?? 0), 0);
  const matchedMeasurementCount = Array.from(matchedIds).reduce((sum, id) => sum + (rowIndicesMap.get(id)?.length ?? 0), 0);

  devLog.log(`📊 loadTimeseries for ${refId}:`, {
    loadedCharacteristics: loadedCharacteristicIds.size,
    timeseriesCharacteristics: timeseriesIds.length,
    matched: {
      characteristics: matchedIds.size,
      ids: Array.from(matchedIds).sort((a, b) => Number(a) - Number(b)).slice(0, 10),
      measurements: matchedMeasurementCount,
    },
    discarded: {
      characteristics: unmatchedIds.length,
      ids: unmatchedIds.sort((a, b) => Number(a) - Number(b)).slice(0, 10),
      measurements: unmatchedMeasurementCount,
    },
  });

  if (matchedIds.size === 0 && timeseriesIds.length > 0) {
    devLog.warn(`⚠️ NO characteristics matched! Loaded: [${Array.from(loadedCharacteristicIds).join(', ')}], Timeseries: [${timeseriesIds.slice(0, 10).join(', ')}]`);
  }
}

export function loadCadLinks(fields: Field[], refId: string) {
  const linksField = fields.find((field) => field.name === 'links');
  if (linksField == null) {
    console.warn('alert-danger', [`CadLinks data - missing 'links' field in ${refId}.`]);
    return [];
  }

  const colorsField = fields.find((field) => field.name === 'colors');
  if (colorsField == null) {
    console.warn('alert-danger', [`CadLinks data - missing 'colors' field in ${refId}.`]);
    return [];
  }
  if (colorsField.values.length !== linksField.values.length) {
    console.warn('alert-danger', [`CadLinks data - fields: 'colors' & 'links' are not even; in ${refId}.`]);
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
    console.warn('alert-danger', [`ScanLinks data - missing 'links' field in ${refId}.`]);
    return [];
  }

  const timesField = fields.find((field) => field.name === 'times');
  if (timesField == null) {
    console.warn('alert-danger', [`ScanLinks data - missing 'times' field in ${refId}.`]);
    return [];
  }
  if (timesField.values.length !== linksField.values.length) {
    console.warn('alert-danger', [`ScanLinks data - fields: 'times' & 'links' are not even; in ${refId}.`]);
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
      console.warn('alert-danger', [`ScanLinks data - invalid time format in ${refId}.`]);
    }
  }

  return scanItems;
}

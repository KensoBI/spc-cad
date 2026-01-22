import { DataFrame, Field } from '@grafana/data';
import { Dictionary, keyBy } from 'lodash';
import { CadDsEntity, ScanItem } from 'types/CadSettings';
import { Feature } from 'types/Feature';

type ColumnsDict = {
  feature?: Field;
  control?: Field;
  nominal?: Field;
  partid?: Field;
  featuretype?: Field;
} & {
  [key: string]: Field;
};
const metaColumns = ['feature', 'control', 'partid', 'featuretype'];

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

  if (!columns.feature || !columns.control || !columns.nominal) {
    console.warn('alert-danger', [`Feature or Control or Nominal column is missing in query ${refId}.`]);
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
    const controlName = columns.control.values[i];
    const partId = columns.partid?.values[i];
    const featureType = columns.featuretype?.values[i];

    const feature = mappedFeatures.getOrDefault(featureName, partId, featureType, refId);

    if (controlName) {
      // Store DataFrame reference instead of copying data
      feature.characteristics[`${controlName}`] = {
        dataFrame,
        rowIndex: i,
        fieldMap,
      };
    }
  }
}

export function loadTimeseries(
  fields: Field[],
  refId: string,
  mappedFeatures: MappedFeatures,
  meta?: Dictionary<any>
) {
  const timeField = fields?.[0];
  if (timeField == null || timeField.name !== 'Time') {
    console.warn('alert-danger', [`Timeseries data - missing Time field in ${refId}.`]);
    return;
  }

  for (let i = 1; i < fields.length; i++) {
    const featureName = fields[i].labels?.feature;
    const controlName = fields[i].labels?.control;
    if (featureName == null || controlName == null) {
      continue;
    }
    const feature = mappedFeatures.get(featureName);
    if (feature == null) {
      continue;
    }

    // NEW: Store Field references directly, no filtering yet
    feature.characteristics[controlName] = {
      ...(feature.characteristics?.[controlName] ?? {}),
      timeseries: {
        timeField,
        valueField: fields[i],
        // validIndices computed lazily on first access
      },
    };
    if (meta != null && Object.keys(meta).length > 0) {
      feature.meta = { ...(feature.meta ?? {}), ...meta };
    }
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

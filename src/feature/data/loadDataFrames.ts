import { ArrayVector, Field, Vector } from '@grafana/data';
import { Dictionary, keyBy, omit } from 'lodash';
import { CadDsEntity, ScanItem } from 'types/CadSettings';
import { Feature } from 'types/Feature';

type VectorField = Field<string, Vector<any>>;
type ColumnsDict = {
  feature?: VectorField;
  control?: VectorField;
  nominal?: VectorField;
  partid?: VectorField;
  featuretype?: VectorField;
} & {
  [key: string]: VectorField;
};
type DataFrameRecord = {
  [key in keyof ColumnsDict]: any;
};

const metaColumns = ['feature', 'control', 'partid', 'featuretype'];

export class MappedFeatures extends Map<string, Feature> {
  getOrDefault = (record: DataFrameRecord, refId: string) => {
    const key = record.feature;
    if (this.has(key)) {
      return this.get(key) as Feature;
    }
    const newFeature: Feature = {
      uid: '',
      id: key,
      partId: record.partid?.toString() ?? '',
      refId: refId,
      name: '',
      type: record.featuretype ?? 'generic',
      position: undefined,
      positionMode: 'undefined',
      characteristics: {},
    };
    this.set(key, newFeature);
    return newFeature;
  };
}

function getRecord(columns: ColumnsDict, i: number) {
  return Object.keys(columns).reduce((acc, key) => {
    acc[key] = columns[key].values.get(i);
    return acc;
  }, {} as DataFrameRecord);
}

export function loadFeaturesByControl(
  fields: Array<Field<string, Vector<any>>>,
  refId: string,
  mappedFeatures: MappedFeatures
) {
  const columns: ColumnsDict = keyBy(fields, (column) => column.name.toLowerCase());

  if (!columns.feature || !columns.control || !columns.nominal) {
    console.warn('alert-danger', [`Feature or Control or Nominal column is missing in query ${refId}.`]);
    return;
  }
  const length = columns.feature.values.length;
  //assert that fields.every(field => field.values.length === length) is true

  for (let i = 0; i < length; i++) {
    const record = getRecord(columns, i);
    const feature = mappedFeatures.getOrDefault(record, refId);

    if (!!record.control) {
      feature.characteristics[`${record.control}`] = {
        table: omit(record, metaColumns),
      };
    }
  }
}

function noNulls(timeVector: Vector<any>, valuesVector: Vector<any>) {
  const t = new ArrayVector<number>();
  const v = new ArrayVector<any>();
  for (let i = 0; i < timeVector.length; i++) {
    if (timeVector.get(i) != null && valuesVector.get(i) != null) {
      t.add(timeVector.get(i));
      v.add(valuesVector.get(i));
    }
  }
  return { t, v };
}

export function loadTimeseries(
  fields: Array<Field<string, Vector<any>>>,
  refId: string,
  mappedFeatures: MappedFeatures,
  meta?: Dictionary<any>
) {
  const timeVector = fields?.[0];
  if (timeVector == null || timeVector.name !== 'Time') {
    console.warn('alert-danger', [`Timeseries data - missing Time vector in ${refId}.`]);
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
    const { t, v } = noNulls(timeVector.values, fields[i].values);
    const timeseries = {
      time: { ...timeVector, values: t },
      values: { ...fields[i], values: v },
    };
    feature.characteristics[controlName] = {
      ...(feature.characteristics?.[controlName] ?? {}),
      timeseries,
    };
    if (meta != null && Object.keys(meta).length > 0) {
      feature.meta = { ...(feature.meta ?? {}), ...meta };
    }
  }
}

export function loadCadLinks(fields: Array<Field<string, Vector<any>>>, refId: string) {
  const linksField = fields.find((field) => field.name === 'links');
  if (linksField == null) {
    console.warn('alert-danger', [`CadLinks data - missing 'links' vector in ${refId}.`]);
    return [];
  }

  const colorsField = fields.find((field) => field.name === 'colors');
  if (colorsField == null) {
    console.warn('alert-danger', [`CadLinks data - missing 'colors' vector in ${refId}.`]);
    return [];
  }
  if (colorsField.values.length !== linksField.values.length) {
    console.warn('alert-danger', [`CadLinks data - vectors: 'colors' & 'links' are not even; in ${refId}.`]);
    return [];
  }

  const cadEntities: CadDsEntity[] = [];
  for (let i = 0; i < colorsField.values.length; i++) {
    const link = linksField.values.get(i);
    if (typeof link !== 'string' || link === '') {
      continue;
    }
    cadEntities.push({
      color: colorsField.values.get(i),
      path: link,
    });
  }

  return cadEntities;
}

export function loadScanLinks(fields: Array<Field<string, Vector<any>>>, refId: string) {
  const linksField = fields.find((field) => field.name === 'links');
  if (linksField == null) {
    console.warn('alert-danger', [`ScanLinks data - missing 'links' vector in ${refId}.`]);
    return [];
  }

  const timesField = fields.find((field) => field.name === 'times');
  if (timesField == null) {
    console.warn('alert-danger', [`ScanLinks data - missing 'times' vector in ${refId}.`]);
    return [];
  }
  if (timesField.values.length !== linksField.values.length) {
    console.warn('alert-danger', [`ScanLinks data - vectors: 'times' & 'links' are not even; in ${refId}.`]);
    return [];
  }

  const scanItems: ScanItem[] = [];
  for (let i = 0; i < linksField.values.length; i++) {
    const link = linksField.values.get(i);
    if (typeof link !== 'string' || link === '') {
      continue;
    }
    const time = timesField.values.get(i);
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

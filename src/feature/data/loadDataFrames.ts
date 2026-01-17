import { Field } from '@grafana/data';
import { Dictionary, keyBy, omit } from 'lodash';
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
    acc[key] = columns[key].values[i];
    return acc;
  }, {} as DataFrameRecord);
}

export function loadFeaturesByControl(
  fields: Field[],
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

function noNulls(timeArray: any[], valuesArray: any[]) {
  const t: number[] = [];
  const v: any[] = [];
  for (let i = 0; i < timeArray.length; i++) {
    if (timeArray[i] != null && valuesArray[i] != null) {
      t.push(timeArray[i]);
      v.push(valuesArray[i]);
    }
  }
  return { t, v };
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
    const { t, v } = noNulls(timeField.values, fields[i].values);
    const timeseries = {
      time: { ...timeField, values: t },
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

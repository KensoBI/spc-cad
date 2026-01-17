import { DataFrame, FieldType } from '@grafana/data';
import { loadCadLinks, loadFeaturesByControl, loadScanLinks, loadTimeseries, MappedFeatures } from './loadDataFrames';
import { Feature } from 'types/Feature';
import { CadDsEntity, ScanItem, FeatureOverridesMap } from 'types/CadSettings';
import { Position, isPosition } from 'types/Position';
import { PositionMode } from 'types/PositionMode';
function setUid(feature: Feature) {
  feature.uid = [feature.id].join('');
}

function isTimeseries(df: DataFrame) {
  return df.meta?.type === 'timeseries-wide' && df.fields?.[0]?.type === FieldType.time;
}

function hasColumn(df: DataFrame, name: string) {
  return df.fields.find((field) => field.name === name) != null;
}

function isFeaturesTable(df: DataFrame) {
  return hasColumn(df, 'feature') && hasColumn(df, 'control') && hasColumn(df, 'nominal');
}

function isCadTable(df: DataFrame) {
  return hasColumn(df, 'links') && hasColumn(df, 'colors');
}

function isScanTable(df: DataFrame) {
  return df.name === 'scans' && hasColumn(df, 'links') && hasColumn(df, 'times');
}

function groupDataFrames(data: DataFrame[]) {
  const tables: DataFrame[] = [];
  const timeseries: DataFrame[] = [];
  const cadFrames: DataFrame[] = [];
  const scanFrames: DataFrame[] = [];
  for (const df of data) {
    if (df.refId == null) {
      continue;
    }
    if (isTimeseries(df)) {
      timeseries.push(df);
    } else if (isFeaturesTable(df)) {
      tables.push(df);
    } else if (isCadTable(df)) {
      cadFrames.push(df);
    } else if (isScanTable(df)) {
      scanFrames.push(df);
    } else {
      console.warn('Unknown DataFrame');
    }
  }
  return {
    tables,
    timeseries,
    cadFrames,
    scanFrames,
  };
}

function featurePosition(feature: Feature, overrides: FeatureOverridesMap): [Position | undefined, PositionMode] {
  const ov = overrides[feature.id];
  if (ov && ov.position === 'none') {
    return [undefined, 'noPosition'];
  }
  if (ov && isPosition(ov.position)) {
    return [ov.position, 'customPosition'];
  }

  const pos = {
    x: Number(feature.characteristics.x?.table?.nominal),
    y: Number(feature.characteristics.y?.table?.nominal),
    z: Number(feature.characteristics.z?.table?.nominal),
  };

  if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) {
    return [undefined, 'undefined'];
  }

  return [pos, 'hasXyzCharacteristics'];
}

export type ParsedData = {
  features: Feature[];
  unpositionedFeatures: Feature[];
  cadDsEntities: CadDsEntity[];
  scansTimeline: ScanItem[];
};

export function parseData(data: DataFrame[], overrides: FeatureOverridesMap): ParsedData {
  const { tables, timeseries, cadFrames, scanFrames } = groupDataFrames(data);

  const mappedFeatures = new MappedFeatures();
  for (const df of tables) {
    loadFeaturesByControl(df.fields, df.refId as string, mappedFeatures);
  }
  for (const df of timeseries) {
    loadTimeseries(df.fields, df.refId as string, mappedFeatures, df.meta);
  }

  const unpositionedFeatures: Feature[] = [];
  const features: Feature[] = [];

  for (const feature of mappedFeatures.values()) {
    const [pos, mode] = featurePosition(feature, overrides);
    feature.position = pos;
    feature.positionMode = mode;

    setUid(feature);
    if (mode === 'undefined') {
      unpositionedFeatures.push(feature);
    } else {
      features.push(feature);
    }
  }

  const cadSettingsMap: { [path: string]: CadDsEntity } = {};
  for (const df of cadFrames) {
    const cadSettings = loadCadLinks(df.fields, df.refId as string);
    for (const cad of cadSettings) {
      cadSettingsMap[cad.path] = cad;
    }
  }

  const scansTimeline: ScanItem[] = [];
  for (const df of scanFrames) {
    const scanItems = loadScanLinks(df.fields, df.refId as string);
    scansTimeline.push(...scanItems);
  }
  // sort by time DESC
  scansTimeline.sort((a, b) => b.time.getTime() - a.time.getTime());

  return {
    features,
    cadDsEntities: Object.values(cadSettingsMap),
    scansTimeline,
    unpositionedFeatures,
  };
}

import { DataFrame, FieldType, isTimeSeriesFrame } from '@grafana/data';
import { loadCadLinks, loadFeaturesByControl, loadForecastBounds, loadScanLinks, loadTimeseries, MappedFeatures } from './loadDataFrames';
import { Feature, findCharacteristicByName } from 'types/Feature';
import { CadDsEntity, ScanItem, FeatureOverridesMap } from 'types/CadSettings';
import { Position, isPosition } from 'types/Position';
import { PositionMode } from 'types/PositionMode';
import { CharacteristicAccessor } from 'types/CharacteristicData';
function setUid(feature: Feature) {
  feature.uid = [feature.id].join('');
}

function hasColumn(df: DataFrame, name: string) {
  return df.fields.find((field) => field.name === name) != null;
}

function isFeaturesTable(df: DataFrame) {
  return hasColumn(df, 'feature') && hasColumn(df, 'characteristic_id') && hasColumn(df, 'nominal');
}

function isCadTable(df: DataFrame) {
  return hasColumn(df, 'links') && hasColumn(df, 'colors');
}

function isScanTable(df: DataFrame) {
  return df.name === 'scans' && hasColumn(df, 'links') && hasColumn(df, 'times');
}

function getFrameType(df: DataFrame): string | undefined {
  return (df.meta?.custom as Record<string, unknown>)?.frameType as string | undefined;
}

/**
 * Detects long-format time series data (e.g., characteristic_id, value, time columns)
 * Unlike Grafana's isTimeSeriesFrame which requires strictly ascending time values,
 * this allows duplicate timestamps which are common in long-format data.
 */
function isLongFormatTimeSeries(df: DataFrame) {
  // Must have at least 3 columns: time, identifier, and value
  if (df.fields.length < 3) {
    return false;
  }

  const hasTimeField = df.fields.some((field) => field.type === FieldType.time);
  const hasNumberField = df.fields.some((field) => field.type === FieldType.number);

  // Check for typical long-format columns: characteristic/characteristic_id + value + time
  const hasCharacteristicColumn = hasColumn(df, 'characteristic') || hasColumn(df, 'characteristic_id');
  const hasValueColumn = hasColumn(df, 'value');

  return hasTimeField && hasNumberField && hasCharacteristicColumn && hasValueColumn;
}

function groupDataFrames(data: DataFrame[]) {
  const tables: DataFrame[] = [];
  const timeseries: DataFrame[] = [];
  const cadFrames: DataFrame[] = [];
  const scanFrames: DataFrame[] = [];
  const forecastUpper: DataFrame[] = [];
  const forecastLower: DataFrame[] = [];
  for (const df of data) {
    // Check frameType first — bounds frames may not have refId
    const frameType = getFrameType(df);
    if (frameType === 'forecast-upper-bound') {
      forecastUpper.push(df);
      continue;
    }
    if (frameType === 'forecast-lower-bound') {
      forecastLower.push(df);
      continue;
    }
    if (df.refId == null) {
      continue;
    }
    // Check specific table types first — they are more specific patterns
    // and must take priority over generic time series detection.
    // A features table with a time column (e.g. lastMeasurementDate) would
    // otherwise be misclassified as a time series by isTimeSeriesFrame().
    if (isFeaturesTable(df)) {
      tables.push(df);
    } else if (isCadTable(df)) {
      cadFrames.push(df);
    } else if (isScanTable(df)) {
      scanFrames.push(df);
    } else if (isTimeSeriesFrame(df) || isLongFormatTimeSeries(df)) {
      timeseries.push(df);
    } else {
      console.warn('Unknown DataFrame');
    }
  }
  return {
    tables,
    timeseries,
    cadFrames,
    scanFrames,
    forecastUpper,
    forecastLower,
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

  // Find x, y, z characteristics by name (not by key)
  const xChar = findCharacteristicByName(feature, 'x');
  const yChar = findCharacteristicByName(feature, 'y');
  const zChar = findCharacteristicByName(feature, 'z');

  const xAccessor = xChar ? new CharacteristicAccessor(xChar) : undefined;
  const yAccessor = yChar ? new CharacteristicAccessor(yChar) : undefined;
  const zAccessor = zChar ? new CharacteristicAccessor(zChar) : undefined;

  const pos = {
    x: Number(xAccessor?.get('nominal')),
    y: Number(yAccessor?.get('nominal')),
    z: Number(zAccessor?.get('nominal')),
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
  const { tables, timeseries, cadFrames, scanFrames, forecastUpper, forecastLower } = groupDataFrames(data);

  const mappedFeatures = new MappedFeatures();
  for (const df of tables) {
    // NEW: Pass entire DataFrame
    loadFeaturesByControl(df.fields, df.refId as string, mappedFeatures, df);
  }
  for (const df of timeseries) {
    loadTimeseries(df.fields, df.refId as string, mappedFeatures, df, df.meta);
  }
  for (const df of forecastUpper) {
    loadForecastBounds(df.fields, df.refId as string, mappedFeatures, df, 'forecastUpper');
  }
  for (const df of forecastLower) {
    loadForecastBounds(df.fields, df.refId as string, mappedFeatures, df, 'forecastLower');
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

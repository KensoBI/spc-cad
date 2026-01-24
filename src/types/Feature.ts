import { Position } from './Position';
import { PositionMode } from './PositionMode';
import { CharacteristicData, CharacteristicAccessor } from './CharacteristicData';

export type Feature = {
  uid: string;
  id: string;
  partId: string;
  refId: string;
  name: string;
  type: string;
  position?: Position;
  positionMode: PositionMode;
  meta?: {
    calculationType?: string;
    [key: string]: any;
  };
  // Updated: Store CharacteristicData instead of plain objects
  characteristics: {
    [characteristic: string]: CharacteristicData;
  };
};

/**
 * Helper function to find a characteristic by its display name.
 * Useful for finding x, y, z characteristics by name.
 */
export function findCharacteristicByName(feature: Feature, name: string): CharacteristicData | undefined {
  const nameLower = name.toLowerCase();
  for (const charData of Object.values(feature.characteristics)) {
    const accessor = new CharacteristicAccessor(charData);
    const displayName = accessor.getDisplayName()?.toLowerCase();
    if (displayName === nameLower) {
      return charData;
    }
  }
  return undefined;
}

export type InfoField = {
  name: string;
  type: string;
};

/**
 * Note: transferableFeature is deprecated with DataFrame-centric refactor.
 * CharacteristicData stores DataFrame references which cannot be serialized.
 * If serialization is needed, a new approach will be required.
 */
export function transferableFeature(feature: Feature) {
  return {
    ...feature,
    characteristics: {
      ...Object.entries(feature.characteristics).reduce((acc, [characteristic, charData]) => {
        if (charData.timeseries) {
          const timeField = charData.timeseries.dataFrame.fields[charData.timeseries.timeFieldIndex];
          const valueField = charData.timeseries.dataFrame.fields[charData.timeseries.valueFieldIndex];
          acc[characteristic] = {
            timeseries: {
              time: {
                name: timeField.name,
                type: timeField.type,
              },
              values: {
                name: valueField.name,
                type: valueField.type,
              },
            },
          };
        }
        return acc;
      }, {} as Record<string, { timeseries?: { time: InfoField; values: InfoField } }>),
    },
  };
}

export type TransferableFeature = ReturnType<typeof transferableFeature>;

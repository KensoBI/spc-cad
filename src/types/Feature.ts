import { Position } from './Position';
import { PositionMode } from './PositionMode';
import { CharacteristicData } from './CharacteristicData';

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
          acc[characteristic] = {
            timeseries: {
              time: {
                name: charData.timeseries.timeField.name,
                type: charData.timeseries.timeField.type,
              },
              values: {
                name: charData.timeseries.valueField.name,
                type: charData.timeseries.valueField.type,
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

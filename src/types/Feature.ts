import { Field, Vector } from '@grafana/data';
import { Position } from './Position';
import { PositionMode } from './PositionMode';
import { Dictionary } from 'lodash';

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
  characteristics: {
    [characteristic: string]: {
      table: {
        [field: string]: any;
      };
      timeseries?: {
        time: Field<string, Vector<number>>;
        values: Field<string, Vector<any>>;
      };
    };
  };
};

export type InfoField = {
  name: string;
  type: string;
};
export function transferableFeature(feature: Feature) {
  return {
    ...feature,
    characteristics: {
      ...Object.entries(feature.characteristics).reduce((acc, [characteristic, { table, timeseries }]) => {
        if (timeseries) {
          acc[characteristic] = {
            table: { ...table },
            timeseries:
              timeseries != null
                ? {
                    time: {
                      name: timeseries.time.name,
                      type: timeseries.time.type,
                    },
                    values: {
                      name: timeseries.values.name,
                      type: timeseries.values.type,
                    },
                  }
                : undefined,
          };
        }
        return acc;
      }, {} as Dictionary<{ table: Dictionary<any>; timeseries?: { time: InfoField; values: InfoField } }>),
    },
  };
}

export type TransferableFeature = ReturnType<typeof transferableFeature>;

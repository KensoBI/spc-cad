import React from 'react';

export type PointCloudState = {
  enabled: boolean;
  range?: number;
  currentValue?: number;
};

const DEFAULT_STATE: PointCloudState = {
  enabled: false,
  range: undefined,
  currentValue: undefined,
} as const;

export function usePointCloudState(): [PointCloudState, React.Dispatch<React.SetStateAction<PointCloudState>>] {
  const [state, setState] = React.useState<PointCloudState>(DEFAULT_STATE);

  return [state, setState];
}

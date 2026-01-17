import React from 'react';
import { usePanelProps } from './PanelPropsProvider';

export function usePanelSize() {
  const { width, height } = usePanelProps();
  return React.useMemo(() => {
    return { width, height };
  }, [height, width]);
}

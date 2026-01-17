import React from 'react';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { useAutoPositioner } from './container';
import {
  LAYOUT_DEFAULT_WINDOW_SPAN,
  LAYOUT_GRID_CELL_HEIGHT,
  LAYOUT_GRID_CELL_VMARGIN,
  LAYOUT_GRID_COLUMN_COUNT,
} from 'constants/global';

export function useOnPin(uid: string) {
  const { options, onOptionsChange, width } = usePanelProps();
  const engine = useAutoPositioner();

  return React.useCallback(() => {
    const an = options.annotations?.find((an) => an.uid === uid);
    if (!an || options.annotations == null) {
      return;
    }
    const { x, y } = engine.current.boxes?.[uid];
    an.gridPos = {
      x: Math.round((x / width) * LAYOUT_GRID_COLUMN_COUNT),
      y: Math.round(y / (LAYOUT_GRID_CELL_HEIGHT + LAYOUT_GRID_CELL_VMARGIN)),
      w: LAYOUT_DEFAULT_WINDOW_SPAN,
      h: LAYOUT_DEFAULT_WINDOW_SPAN,
    };
    an.display = 'window';
    options.annotations = [...options.annotations];
    onOptionsChange(options);
  }, [engine, options, onOptionsChange, uid, width]);
}

export function useOnUnPin(uid: string) {
  const { options, onOptionsChange } = usePanelProps();

  return React.useCallback(() => {
    const an = options.annotations?.find((an) => an.uid === uid);
    if (!an || options.annotations == null) {
      return;
    }
    an.gridPos = undefined;
    an.display = 'label';
    options.annotations = [...options.annotations];
    onOptionsChange(options);
  }, [options, onOptionsChange, uid]);
}

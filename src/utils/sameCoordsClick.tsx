import { isEqual } from 'lodash';
import React from 'react';
export type ClickCoordinates = {
  x: number;
  y: number;
};

type MouseCoordsEvent = Pick<MouseEvent, "clientX" | "clientY">

export class SameCoordsClick {
  private clickCoords: ClickCoordinates = { x: 0, y: 0 };

  onMouseDown(e: MouseCoordsEvent) {
    this.clickCoords = this.eventToClickCoordinates(e);
  }

  isClick(e: MouseCoordsEvent) {
    return isEqual(this.eventToClickCoordinates(e), this.clickCoords);
  }

  private eventToClickCoordinates(e: MouseCoordsEvent): ClickCoordinates {
    return {
      x: e.clientX,
      y: e.clientY,
    };
  }
}

type CallbackType<T extends Element = Element> = (e: React.MouseEvent<T>) => void

export function useSameCoordsClick<T extends Element = Element>(callback?: CallbackType<T>) {
  const isClickRef = React.useRef(new SameCoordsClick());

  const onMouseDown = React.useCallback((e: React.MouseEvent<T>) => {
    isClickRef.current.onMouseDown(e);
  }, []);

  const onClick = React.useCallback(
    (e: React.MouseEvent<T>) => {
      if (isClickRef.current.isClick(e)) {
        e.stopPropagation();
        callback?.(e);
      }
    },
    [callback]
  );

  return {
    onMouseDown,
    onClick,
  };
}

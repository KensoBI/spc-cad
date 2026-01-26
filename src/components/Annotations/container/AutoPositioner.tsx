import SceneViewModel from 'components/Scene/SceneViewModel';
import React from 'react';
import { Mesh, Vector3 } from 'three';
import { get2DCoords } from 'utils/cadUtils';
import {
  Layout,
  LayoutItem,
  moveElement,
  getFirstCollision,
  getInitialItemLayout,
} from 'components/Annotations/container/layout';
import { keyBy } from 'lodash';

type Size = {
  width: number;
  height: number;
};

type OnPositionChange = (x: number, y: number) => void;
type OnLineChange = (lineX1: number, lineY1: number, lineX2: number, lineY2: number) => void;

type Box = LayoutItem & {
  onPositionChange?: OnPositionChange;
  onLineChange: OnLineChange;
  initialized: boolean;
};

type BoxesMap = {
  [uid: string]: Box;
};

export class AutoPositionerEngine {
  boxes: BoxesMap;
  panelSize: Size;

  sceneViewModel?: SceneViewModel;

  constructor() {
    this.boxes = {};
    this.panelSize = { width: 0, height: 0 };
  }

  registerBox(uid: string, isStatic: boolean, onLineChange: OnLineChange, onPositionChange?: OnPositionChange) {
    if (uid in this.boxes) {
      const box = this.boxes[uid];
      box.onPositionChange = onPositionChange;
    } else {
      this.boxes[uid] = {
        w: 127, //we don't know actual size yet
        h: 32,
        x: 0,
        y: 0,
        i: uid,
        moved: false,
        static: isStatic,
        meshX: 0,
        meshY: 0,
        onLineChange,
        onPositionChange,
        initialized: isStatic,
      };
    }
  }

  removeBox(uid: string) {
    delete this.boxes[uid];
  }

  onBoxResize(uid: string, newSize: Size) {
    if (uid in this.boxes) {
      if (this.boxes[uid].w !== newSize.width || this.boxes[uid].h !== newSize.height) {
        this.boxes[uid].w = newSize.width;
        this.boxes[uid].h = newSize.height;
        return true;
      }
    } else {
      console.warn(`onResize on non existing box`);
    }
    return false;
  }

  onBoxMove(uid: string, x: number, y: number) {
    if (uid in this.boxes) {
      const label = this.boxes[uid];
      label.x = x;
      label.y = y;

      label.onLineChange(label.meshX, label.meshY, label.x + label.w / 2, label.y + label.h / 2);
    } else {
      console.warn(`onBoxMove on non existing box`);
    }
  }

  onPanelResize(newSize: Size) {
    this.panelSize = newSize;
  }

  updatePosition() {
    const camera = this.sceneViewModel?.getCamera?.();
    const featureMeshes = this.sceneViewModel?.getAllCharacteristicMeshes();
    if (!camera || !featureMeshes) {
      return;
    }

    const layout = Object.values(this.boxes);
    const meshDict = keyBy(featureMeshes, (mesh) => mesh.name);

    for (const label of layout) {
      const uid = label.i;
      const meshCoords = this.meshCoords2D(meshDict?.[uid]);
      if (!meshCoords) {
        continue;
      }
      const desired = {
        x: meshCoords.x + 30,
        y: meshCoords.y + 30,
      };
      const prev = {
        x: label.x,
        y: label.y,
        meshX: label.meshX,
        meshY: label.meshY,
      };

      label.meshX = meshCoords.x;
      label.meshY = meshCoords.y;

      if (!label.initialized) {
        label.x = desired.x;
        label.y = desired.y;

        this.boxes[uid] = { ...this.boxes[uid], ...getInitialItemLayout(label, layout), initialized: true };
      } else {
        if (!label.static) {
          this.calculatePosition(label, layout, meshCoords, desired);
        }
      }

      const labelPosChanged = prev.x !== label.x || prev.y !== label.y;
      const meshPosChanged = prev.meshX !== label.meshX || prev.meshY !== label.meshY;

      if (labelPosChanged && !label.static && label.onPositionChange) {
        label.onPositionChange(label.x, label.y);
      }

      if (labelPosChanged || meshPosChanged) {
        label.onLineChange(label.meshX, label.meshY, label.x + label.w / 2, label.y + label.h / 2);
      }
    }
  }

  meshCoords2D(mesh?: Mesh) {
    const camera = this.sceneViewModel?.getCamera?.();
    if (!camera || !mesh) {
      return undefined;
    }
    // Ensure camera matrices are up to date before projecting
    camera.updateMatrixWorld();
    mesh.updateMatrixWorld();
    const position = new Vector3();
    mesh.getWorldPosition(position);
    return get2DCoords(position, camera, this.panelSize.width, this.panelSize.height);
  }

  calculatePosition(elToMove: Box, layout: Layout, meshCoords2D: Vector3, desired: { x: number; y: number }) {
    layout = moveElement(layout, elToMove, desired.x, desired.y, true, true, 'vertical');

    //check if it was moved
    if (elToMove.x !== desired.x && elToMove.y !== desired.y) {
      //not moved, try move it 20% closer
      layout = moveElement(
        layout,
        elToMove,
        (desired.x - elToMove.x) * 0.2 + elToMove.x,
        (desired.y - elToMove.y) * 0.2 + elToMove.y,
        true,
        true,
        'vertical'
      );
    }

    //still in collision? move down
    if (getFirstCollision(layout, elToMove)) {
      getInitialItemLayout(elToMove, layout);
    }
  }
}

const emptyDefaultEngineRef = {
  current: new AutoPositionerEngine(),
};

export const AutoPositionerContext =
  React.createContext<React.MutableRefObject<AutoPositionerEngine>>(emptyDefaultEngineRef);

export function useAutoPositioner() {
  return React.useContext(AutoPositionerContext);
}

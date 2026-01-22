declare module 'three/examples/jsm/helpers/ViewHelper.js' {
  import { Camera, Object3D, WebGLRenderer, Vector3 } from 'three';

  export class ViewHelper extends Object3D {
    isViewHelper: boolean;
    animating: boolean;
    center: Vector3;

    constructor(camera: Camera, domElement?: HTMLElement);

    render(renderer: WebGLRenderer): void;
    handleClick(event: PointerEvent): boolean;
    update(delta: number): void;
    setLabels(labelX?: string, labelY?: string, labelZ?: string): void;
    setLabelStyle(font?: string, color?: string, radius?: number): void;
    dispose(): void;
  }
}

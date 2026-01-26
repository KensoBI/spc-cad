import { Camera, Vector3 } from 'three';

export function get2DCoords(position: Vector3, camera: Camera, parentWidth: number, parentHeight: number) {
  const vector = position.project(camera);
  vector.x = Math.round(((vector.x + 1) / 2) * parentWidth);
  vector.y = Math.round((-(vector.y - 1) / 2) * parentHeight);
  return vector;
}

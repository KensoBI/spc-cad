export type Position = {
  x: number;
  y: number;
  z: number;
};

export function isPosition(obj: any): obj is Position {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.x === 'number' &&
    typeof obj.y === 'number' &&
    typeof obj.z === 'number'
  );
}

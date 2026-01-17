import { Mesh, MeshLambertMaterial, MeshStandardMaterial, Points } from 'three';

export const isMesh = (obj: any): obj is Mesh => {
  return obj.type === 'Mesh' && obj.isMesh;
};

export const isMeshStandardMaterial = (obj: any): obj is MeshStandardMaterial => {
  return obj.type === 'MeshStandardMaterial' && obj.isMeshStandardMaterial;
};

export const isMeshLambertMaterial = (obj: any): obj is MeshLambertMaterial => {
  return obj.type === 'MeshLambertMaterial' && obj.isMeshLambertMaterial;
};

export const isPoints = (obj: any): obj is Points => {
  return obj.type === 'Points' && obj.isPoints;
};

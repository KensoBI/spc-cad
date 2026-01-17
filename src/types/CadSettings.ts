import { Mesh } from 'three';
import { Position } from './Position';

export type MeshClickedCallback = (uid: string, parentMesh: Mesh) => void;

export type RaycastAllCallback = (x: number, y: number, z: number) => void;

export type CadDsEntity = {
  path: string;
  color: string;
};

export type ScanItem = {
  link: string;
  time: Date;
};

export type CadSettings = {
  id: number;
  path: string;
  color: string;
};

export type SceneSettings = {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  upX: number;
  upY: number;
  upZ: number;
};

export type FeatureSettings = {
  size: number;
  color: string;
};

export type FeatureOverrides = {
  position: Position | 'none';
};

export type FeatureOverridesMap = {
  [id: string]: FeatureOverrides;
};

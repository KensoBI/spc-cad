import { BufferGeometry, Loader } from 'three';

export class CustomPLYLoader extends Loader {
  constructor(manager?: any);
  propertyNameMapping: Record<string, string>;
  customPropertyMapping: Record<string, string[]>;
  load(
    url: string,
    onLoad: (geometry: BufferGeometry) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (error: Error) => void
  ): void;
  setPropertyNameMapping(mapping: Record<string, string>): void;
  parse(data: ArrayBuffer | string): BufferGeometry;
}

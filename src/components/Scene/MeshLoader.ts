import {
  MeshLambertMaterial,
  BufferGeometry,
  Mesh,
  DoubleSide,
  Euler,
  Object3D,
  MeshStandardMaterial,
  FileLoader,
  Points,
  BufferAttribute,
  PointsMaterial,
  ShaderMaterial,
  InterleavedBufferAttribute,
  Material,
  PlaneGeometry,
  TextureLoader,
} from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { CadLoadingProgressCallback } from 'types/SpcCadOptions';
import { CadSettings } from 'types/CadSettings';
import { CustomPLYLoader } from './CustomPlyLoader';
import { gradientColors, gradientColorsInShader } from './gradientColors';
import { Dictionary } from 'lodash';
import { inflate } from 'pako';

export type OnObject3dLoaded = (mesh: Object3D, settings: CadSettings) => void;
const POINT_CLOUD_RANGE_KEY = 'pointCloudRange';

type Compression = {
  extensions: string[];
  inflator: (content: ArrayBuffer, toString: boolean) => ArrayBuffer | string;
};

type Extension = {
  extension: string;
  responseType: string;
  loader: (content: string | ArrayBuffer) => Object3D | null;
};

type ImagesAndMeshes = {
  images: CadSettings[];
  meshes: CadSettings[];
};

const TEXT_RESPONSE_TYPE = 'text';
const ARRAY_BUFFER_RESPONSE_TYPE = 'arraybuffer';
export class MeshLoader {
  cadLoadingProgressCallback: CadLoadingProgressCallback;
  onObject3dLoaded: OnObject3dLoaded;
  cadSettings: CadSettings[];
  pointCloudRange?: number;
  progressDict: Dictionary<number> = {};
  compressions: Dictionary<Compression> = {
    gzip: {
      extensions: ['.gz', '.gzip'],
      inflator: this.gzipInflator,
    },
  };
  extensions: Extension[] = [
    {
      extension: '.stl',
      responseType: ARRAY_BUFFER_RESPONSE_TYPE,
      loader: this.parseStlMesh,
    },
    {
      extension: '.3mf',
      responseType: ARRAY_BUFFER_RESPONSE_TYPE,
      loader: this.parse3mfMesh,
    },
    {
      extension: '.ply',
      responseType: ARRAY_BUFFER_RESPONSE_TYPE,
      loader: this.parsePlyMesh,
    },
    {
      extension: '.asc',
      responseType: TEXT_RESPONSE_TYPE,
      loader: this.parseAscPoints,
    },
  ];

  constructor(
    cadSettings: CadSettings[],
    cadLoadingProgressCallback: CadLoadingProgressCallback,
    onObject3dLoaded: OnObject3dLoaded,
    pointCloudRange?: number
  ) {
    this.cadLoadingProgressCallback = cadLoadingProgressCallback;
    this.onObject3dLoaded = onObject3dLoaded;
    this.cadSettings = cadSettings;
    this.pointCloudRange = pointCloudRange;
  }

  loadMeshes() {
    const loaders: Array<Promise<void>> = [];
    const errors: string[] = [];

    const notEmptyCadSettings = this.cadSettings.filter((cad) => cad.path !== '' && cad.path);

    for (const settings of notEmptyCadSettings) {
      this.progressDict[settings.path] = 0.0;
    }

    const { images, meshes } = notEmptyCadSettings.reduce<ImagesAndMeshes>(
      (acc, settings) => {
        // Use fileName for Base64 files, otherwise use path
        const pathForExtension = settings.source === 'base64' && settings.fileName ? settings.fileName : settings.path;
        if (this.matchImageExtension(pathForExtension)) {
          acc.images.push(settings);
        } else {
          acc.meshes.push(settings);
        }
        return acc;
      },
      { images: [], meshes: [] }
    );

    for (const settings of images) {
      this.loadImage(settings);
    }

    //init loaders, start loading and wait for all to finish
    for (const settings of meshes) {
      // Use fileName for Base64 files, otherwise use path
      const pathForExtension = settings.source === 'base64' && settings.fileName ? settings.fileName : settings.path;
      const { ext, compression } = this.findExtension(pathForExtension);

      if (!ext) {
        errors.push(settings.path);
        console.error('Unsupported extension ' + settings.path);
        this.progressDict[settings.path] = 1.0;
        continue;
      }

      const fileLoaderPromise = this.loadFile(settings, ext.responseType, ext.loader.bind(this), compression);

      const loaderPromise = fileLoaderPromise
        .then((mesh) => {
          this.onObject3dLoaded(mesh, settings);
        })
        .catch((e) => {
          errors.push(settings.path);
          console.error(e);
        });

      loaders.push(loaderPromise);
    }

    Promise.allSettled(loaders).then(() => {
      this.cadLoadingProgressCallback(1, true, errors);
    });
  }

  loadFile(
    settings: CadSettings,
    responseType: string,
    parse: (content: string | ArrayBuffer) => Object3D | null,
    compression?: Compression
  ) {
    return new Promise<Object3D>((resolve, reject) => {
      // Handle Base64 data URLs
      if (settings.path.startsWith('data:')) {
        try {
          let content: string | ArrayBuffer;

          if (responseType === ARRAY_BUFFER_RESPONSE_TYPE) {
            content = this.base64ToArrayBuffer(settings.path);
          } else {
            content = this.base64ToString(settings.path);
          }

          if (compression) {
            content = compression.inflator(content as ArrayBuffer, responseType === TEXT_RESPONSE_TYPE);
          }

          const mesh = parse(content);
          if (!mesh) {
            reject('Could not parse mesh');
            return;
          }

          this.progressDict[settings.path] = 1.0;
          this.cadLoadingProgressCallback(1.0, false);

          resolve(mesh);
        } catch (error) {
          reject(`Failed to decode Base64 file: ${error}`);
        }
        return;
      }

      // Handle URL loading
      const loader = new FileLoader();
      loader.setResponseType(compression ? ARRAY_BUFFER_RESPONSE_TYPE : responseType);
      const onLoad = (content: string | ArrayBuffer) => {
        if (compression) {
          content = compression.inflator(content as ArrayBuffer, responseType === TEXT_RESPONSE_TYPE);
        }

        const mesh = parse(content);
        if (!mesh) {
          reject('Could not parse mesh');
          return;
        }
        resolve(mesh);
      };

      const onProgress = (xhr: { loaded: number; total: number }) => {
        this.progressDict[settings.path] = xhr.loaded / xhr.total;
        const sum = Object.values(this.progressDict).reduce((a, b) => a + b, 0);
        const length = Object.values(this.progressDict).length;
        const avgProgress = sum / length;
        this.cadLoadingProgressCallback(avgProgress, false);
      };

      loader.load(settings.path, onLoad, onProgress, reject);
    });
  }

  private base64ToArrayBuffer(dataUrl: string): ArrayBuffer {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  private base64ToString(dataUrl: string): string {
    const base64 = dataUrl.split(',')[1];
    return atob(base64);
  }

  parseStlMesh(content: string | ArrayBuffer) {
    const stlLoader = new STLLoader();
    const geometry = stlLoader.parse(content);
    geometry.computeVertexNormals();
    const mesh = new Mesh(geometry, new MeshLambertMaterial({ vertexColors: false, side: DoubleSide }));

    return mesh;
  }

  parse3mfMesh(content: string | ArrayBuffer) {
    const theeMfLoader = new ThreeMFLoader();
    if (typeof content === 'string') {
      return null;
    }
    const object = theeMfLoader.parse(content);
    object.quaternion.setFromEuler(new Euler(-Math.PI / 2, 0, 0)); // z-up conversion
    object.traverse(function (child: any) {
      child.castShadow = true;
    });

    if (object.isGroup && object.children.length > 0) {
      object.position.setY(-1 * object.children[0].position.z);
      object.position.setZ(object.children[0].position.y);
    }

    return object;
  }

  parsePlyMesh(content: string | ArrayBuffer) {
    const plyLoader = new CustomPLYLoader();
    const geometry = plyLoader.parse(content);

    geometry.computeVertexNormals();

    //get first attribute which is not (position, normal, color, uv)
    let firstCustomAttribute: BufferAttribute | InterleavedBufferAttribute | null = null;
    let firstCustomAttributeName: string | null = null;

    for (const key in geometry.attributes) {
      if (key === 'position' || key === 'normal' || key === 'color' || key === 'uv') {
        continue;
      }
      firstCustomAttribute = geometry.getAttribute(key);
      firstCustomAttributeName = key;
      break;
    }

    //treat the first custom attribute as deviation
    const deviationAttribute = firstCustomAttribute;

    let range: number | null = null;
    if (deviationAttribute) {
      geometry.setAttribute('deviation', deviationAttribute);
      geometry.deleteAttribute(firstCustomAttributeName!);

      const deviations = deviationAttribute.array as Float32Array;
      range = this.calcDeviationRange(deviations);
      if (this.pointCloudRange == null) {
        this.pointCloudRange = range;
      }
    }

    let material: Material | null = null;

    if (deviationAttribute != null && this.pointCloudRange != null) {
      const vertexShader = `
            varying vec3 vColor;
      
            attribute float deviation;

            float normalized;
            
            void main() {
              ${gradientColorsInShader(this.pointCloudRange, 'deviation', 'normalized', 'vColor')}
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `;

      const fragmentShader = `
            varying vec3 vColor;
      
            void main() {
              gl_FragColor = vec4(vColor, 1.0);
            }
          `;

      material = new ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });
    } else {
      material = new MeshStandardMaterial({
        color: 0xffa852,
        roughness: 0.5,
        metalness: 0.5,
      });
    }

    const mesh = new Mesh(geometry, material);

    if (range != null) {
      mesh.userData[POINT_CLOUD_RANGE_KEY] = range;
    }

    return mesh;
  }

  parseAscPoints(content: string | ArrayBuffer) {
    if (!content) {
      return null;
    }

    const lines = content.toString().split('\n');
    const parsedData = new Float32Array(lines.length * 4); //x y z deviation
    let validLinesCounter = 0;
    for (let i = 0; i < lines.length; i++) {
      const splitted = lines[i].split(' ');
      if (splitted.length < 7) {
        console.warn("Invalid line format, expected 'x y z normX normY normZ deviation' but got " + lines[i]);
        continue;
      }

      const [_, x, y, z, _normX, _normY, _normZ, deviation = '0'] = splitted;

      parsedData[validLinesCounter * 4] = parseFloat(x);
      parsedData[validLinesCounter * 4 + 1] = parseFloat(y);
      parsedData[validLinesCounter * 4 + 2] = parseFloat(z);

      const deviationFloat = parseFloat(deviation);
      parsedData[validLinesCounter * 4 + 3] = deviationFloat;

      validLinesCounter++;
    }

    const positions = new Float32Array(validLinesCounter * 3);
    const colors = new Float32Array(validLinesCounter * 3);
    const deviations = new Float32Array(validLinesCounter);

    for (let i = 0; i < validLinesCounter; i++) {
      //assign positions
      positions[i * 3] = parsedData[i * 4];
      positions[i * 3 + 1] = parsedData[i * 4 + 1];
      positions[i * 3 + 2] = parsedData[i * 4 + 2];

      //assign deviations
      deviations[i] = parsedData[i * 4 + 3];
    }

    const range = this.calcDeviationRange(deviations);
    if (this.pointCloudRange == null) {
      this.pointCloudRange = range;
    }

    for (let i = 0; i < validLinesCounter; i++) {
      //assign colors
      const deviation = deviations[i];
      const color = gradientColors(deviation, this.pointCloudRange);

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('deviation', new BufferAttribute(deviations, 1));

    const material = new PointsMaterial({ vertexColors: true, size: 10 });

    const pointsObject = new Points(geometry, material);

    //add metadata
    pointsObject.userData[POINT_CLOUD_RANGE_KEY] = range;

    return pointsObject;
  }

  private matchExtension(path: string, extension: string) {
    return path.toLowerCase().endsWith(extension.toLowerCase());
  }

  private findCompression(path: string) {
    for (const key in this.compressions) {
      const compression = this.compressions[key as keyof typeof this.compressions];
      for (const ext of compression.extensions) {
        if (this.matchExtension(path, ext)) {
          return { obj: compression, ext };
        }
      }
    }
    return undefined;
  }

  private findExtension(path: string) {
    let compression = this.findCompression(path);

    if (compression) {
      path = path.substring(0, path.length - compression.ext.length);
    }
    const ext = this.extensions.find((p) => this.matchExtension(path, p.extension));
    return {
      ext,
      compression: compression?.obj,
    };
  }

  private matchImageExtension(path: string) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'svg'];
    return imageExtensions.some((ext) => this.matchExtension(path, ext));
  }

  static getRangeFromPointCloud(pointCloud: Object3D) {
    const value = pointCloud.userData[POINT_CLOUD_RANGE_KEY];
    if (typeof value === 'number') {
      return value;
    }
    return undefined;
  }

  private gzipInflator(content: ArrayBuffer, toString: boolean): ArrayBuffer | string {
    if (toString) {
      return inflate(content, { to: 'string' });
    } else {
      const result = inflate(content);
      return result.buffer as ArrayBuffer;
    }
  }

  private calcDeviationRange(deviations: Float32Array) {
    let deviationSum = 0.0;

    // First pass: compute mean
    for (let i = 0; i < deviations.length; i++) {
      deviationSum += Math.abs(deviations[i]);
    }
    const deviationAvg = deviationSum / deviations.length;

    // Second pass: compute standard deviation
    let varianceSum = 0.0;
    for (let i = 0; i < deviations.length; i++) {
      varianceSum += Math.pow(deviations[i] - deviationAvg, 2);
    }
    const deviationStdDev = Math.sqrt(varianceSum / deviations.length);

    // Return range centered around zero, based on standard deviation
    return deviationStdDev * 2; // 2 sigma covers approximately 95% of data in a normal distribution
  }

  private loadImage(settings: CadSettings) {
    const textureLoader = new TextureLoader();

    textureLoader.load(settings.path, (texture) => {
      //get resolution and aspect ratio
      const { width, height } = texture.image;
      const planeGeometry = new PlaneGeometry(width, height);

      const material = new MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: DoubleSide,
      });
      const mesh = new Mesh(planeGeometry, material);
      this.onObject3dLoaded(mesh, settings);
    });
  }
}

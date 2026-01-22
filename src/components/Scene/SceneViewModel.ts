import _ from 'lodash';
import { Feature } from '../../types/Feature';
import {
  CadSettings,
  FeatureSettings,
  MeshClickedCallback,
  RaycastAllCallback,
  SceneSettings,
} from '../../types/CadSettings';
import * as THREE from 'three';
import {
  SphereGeometry,
  Raycaster,
  Vector2,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AxesHelper,
  Group,
  DirectionalLight,
  Vector3,
  Euler,
  Quaternion,
  Box3,
  Mesh,
  MeshLambertMaterial,
  Camera,
} from 'three/src/Three';
import * as TWEEN from '@tweenjs/tween.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { ViewHelper } from './ViewHelper';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  CadLoadingProgressCallback,
  defaults,
  SceneSettingsActionCallback,
  SetPointCloudModeCallback,
} from 'types/SpcCadOptions';
import { FeatureModel } from 'types/AnnotationModel';
import { SameCoordsClick } from 'utils/sameCoordsClick';
import { MeshLoader, OnObject3dLoaded } from './MeshLoader';
import PointCloud from './PointCloud';
import { isMesh, isMeshLambertMaterial, isMeshStandardMaterial, isPoints } from './typeCheckers';
import { DEFAULT_SCENE_SETTINGS } from 'constants/defaults';
import { objectDiff } from 'utils/objectDiff';
import { hashCode } from 'utils/hashCode';

export default class SceneViewModel {
  private _cadContainer: HTMLDivElement | null = null;
  private _isInitialized = false;
  private _canvasPosition: any;
  private _renderer: WebGLRenderer | null = null;
  private _mousePosition: any;
  private _hoverPoint: any;
  private _scene: any;
  private _characteristicGroup: any;
  private _sphereGeometry: any;
  private _containerWidth = 0;
  private _containerHeight = 0;
  //private _pointLight: any;
  //private _sphereMaterial: any;
  private _raycaster?: Raycaster;
  private _globalRaycaster?: Raycaster;
  //private _projector: any;
  //private _mouseVector: any;
  private _camera: any;
  private _cadControls: any;
  private _characteristicNamesArray: any[] = [];
  private _animationFrameId = 0;
  private _settings: SceneSettings;
  private _settings0: SceneSettings;
  private _isTweening = false;
  private _cadSettings: CadSettings[] = [];
  private _featureSettings: FeatureSettings;
  private sameCoordsClick = new SameCoordsClick();
  private pointCloud: PointCloud;
  private tmpPoint: Mesh;
  private _viewHelper: ViewHelper | null = null;
  private _viewHelperVisible = false;
  private _viewHelperContainer: HTMLDivElement | null = null;
  private _viewHelperClickHandler: ((event: PointerEvent) => void) | null = null;
  private _clock = new THREE.Clock();
  //callbacks
  cadLoadingProgressCallback: CadLoadingProgressCallback;

  onSceneSettingsChange?: SceneSettingsActionCallback;
  onMeshClicked?: MeshClickedCallback;
  onRaycastAll?: RaycastAllCallback;
  onAfterRender?: () => void;

  constructor(
    settings: SceneSettings,
    featureSettings: FeatureSettings,
    cadLoadingProgressCallback: CadLoadingProgressCallback,
    setPointCloudMode: SetPointCloudModeCallback
  ) {
    this._featureSettings = featureSettings;
    this._settings = settings;
    this.cadLoadingProgressCallback = cadLoadingProgressCallback;

    this.pointCloud = new PointCloud(setPointCloudMode);
    this.tmpPoint = new Mesh(new SphereGeometry(50, 32, 32), new MeshLambertMaterial({ color: 0xff0000 }));

    if (!this._settings) {
      this._settings = defaults.sceneSettings;
    }

    if (!this._featureSettings) {
      this._featureSettings = defaults.featureSettings;
    }

    this.tmpPoint.scale.set(
      this._featureSettings.size / 100,
      this._featureSettings.size / 100,
      this._featureSettings.size / 100
    );

    this._settings0 = {} as SceneSettings;
    _.defaultsDeep(this._settings0, settings);
  }

  private bindUIActions() {
    if (this._cadContainer === null) {
      console.warn('CAD container not set!');
      return;
    }
    this._cadContainer.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    this._cadContainer.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    this._cadContainer.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    this._cadContainer.addEventListener('mouseenter', this.onMouseEnter.bind(this), false);
    this._cadContainer.addEventListener('mouseleave', this.onMouseLeave.bind(this), false);
    //this._cadContainer.addEventListener('pointerup', this.onPointerUp.bind(this),false );
    //this._cadContainer.addEventListener('pointerup', this.onPointerUp.bind(this),false );
  }

  private onMouseMove(event: { clientX: number; clientY: number }) {
    if (this._renderer == null) {
      return;
    }
    this._canvasPosition = this._renderer.domElement.getBoundingClientRect();
    const cX = event.clientX - this._canvasPosition.left;
    const cY = event.clientY - this._canvasPosition.top;

    this._mousePosition.x = (cX / this._containerWidth) * 2 - 1;
    this._mousePosition.y = -(cY / this._containerHeight) * 2 + 1;
  }

  private onMouseUp(e: MouseEvent): void {
    if (this.sameCoordsClick.isClick(e) !== true) {
      return;
    }
    if (this._hoverPoint !== null && this._characteristicGroup) {
      const selectedObject = this._characteristicGroup.getObjectByName(this._hoverPoint);

      if (selectedObject !== undefined && selectedObject !== null && this.onMeshClicked) {
        this.onMeshClicked(this._hoverPoint, selectedObject);
      }
    }

    if (this.onRaycastAll) {
      this.raycastAll(this.onRaycastAll);
    }

    this.pointCloud.raycast(this._mousePosition, this._camera, this._scene);
  }

  private onMouseDown(e: MouseEvent) {
    this.sameCoordsClick.onMouseDown(e);
    this.pointCloud.hideSelectedPoint();
  }

  private onMouseEnter() {
    this.showViewHelper();
  }

  private onMouseLeave() {
    this.hideViewHelper();
  }

  private onPointerUp(event: PointerEvent) {
    if (this._viewHelper) {
      this._viewHelper.handleClick(event);
    }
  }

  private initializeScene() {
    if (this._cadContainer === null) {
      console.warn('CAD container not set!');
      return;
    }

    this._sphereGeometry = new SphereGeometry(82, 32, 32);
    //this._sphereMaterial = new THREE.MeshLambertMaterial({ color: 0x4285F4 });

    if (this._containerHeight === 0 || this._containerWidth === 0) {
      this._containerWidth = this._cadContainer.clientWidth;
      this._containerHeight = this._cadContainer.clientHeight;
    }

    this._renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this._renderer.setSize(this._containerWidth, this._containerHeight);
    this._renderer.autoClear = false; // Required for ViewHelper to render properly
    this._cadContainer.appendChild(this._renderer.domElement);

    // Add object picking
    this._raycaster = new Raycaster();
    this._globalRaycaster = new Raycaster();
    this._mousePosition = new Vector2();
    this._scene = new Scene();

    this._camera = new PerspectiveCamera(10, this._containerWidth / this._containerHeight, 1, 100000);
    this._camera.position.set(this._settings.cameraX, this._settings.cameraY, this._settings.cameraZ);
    this._camera.up.setX(this._settings.upX);
    this._camera.up.setY(this._settings.upY);
    this._camera.up.setZ(this._settings.upZ);
    this._camera.lookAt(this._scene.position);
    this._scene.add(this._camera);

    const axesHelper = new AxesHelper(55);
    this._scene.add(axesHelper);

    this._characteristicGroup = new Group();
    this._scene.add(this._characteristicGroup);

    this.pointCloud.initializeScene(this._scene);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 350, 250);
    directionalLight.castShadow = true;
    this._camera.add(directionalLight);

    //use edges geometry
    const c = new TrackballControls(this._camera, this._renderer.domElement);
    c.noPan = false;
    c.rotateSpeed = 2;
    c.zoomSpeed = 0.3;
    c.panSpeed = 0.3;
    c.target.setX(this._settings.targetX);
    c.target.setY(this._settings.targetY);
    c.target.setZ(this._settings.targetZ);
    this._cadControls = c;



    // Initialize ViewHelper for orientation gizmo
    this._viewHelper = new ViewHelper(this._camera, this._renderer.domElement);
    this._viewHelper.center.copy(this._cadControls.target);
    this._viewHelper.setLabels('X', 'Y', 'Z');


        // Create ViewHelper container div with absolute positioning
    this._viewHelperContainer = document.createElement('div');
    this._viewHelperContainer.id = 'viewHelper';
    this._viewHelperContainer.style.position = 'absolute';
    this._viewHelperContainer.style.right = '0';
    this._viewHelperContainer.style.bottom = '0';
    this._viewHelperContainer.style.height = '128px';
    this._viewHelperContainer.style.width = '128px';
    this._viewHelperContainer.style.pointerEvents = 'none';
    this._cadContainer.appendChild(this._viewHelperContainer);

    // Attach pointerup listener to the renderer canvas for ViewHelper interaction
    this._viewHelperClickHandler = (event: PointerEvent) => {
      if (!this._viewHelper || !this._viewHelperVisible || !this._renderer) {
        return;
      }

      // Check if click is within ViewHelper bounds (bottom-right 128x128 area)
      const rect = this._renderer.domElement.getBoundingClientRect();
      const dim = 128; // ViewHelper size
      const offsetX = rect.left + (this._renderer.domElement.offsetWidth - dim);
      const offsetY = rect.top + (this._renderer.domElement.offsetHeight - dim);

      // Check if click is within the bottom-right corner
      if (event.clientX >= offsetX && event.clientY >= offsetY) {
        this._viewHelper.handleClick(event);
      }
    };
    this._renderer.domElement.addEventListener('pointerup', this._viewHelperClickHandler);
  }

  initialize(): Promise<void> {
    this.bindUIActions();
    this.initializeScene();
    requestAnimationFrame(this.animateScene.bind(this));
    this._isInitialized = true;
    return Promise.resolve();
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  resetViewToDefault() {
    this.applySettings(DEFAULT_SCENE_SETTINGS);
  }

  restoreView() {
    this.applySettings(this._settings0);
  }

  private applySettings(settings: Readonly<SceneSettings>) {
    const origPosition = new Vector3().copy(this._camera.position); // original position
    const origRotation = new Euler().copy(this._camera.rotation); // original rotation

    this._camera.position.set(settings.cameraX, settings.cameraY, settings.cameraZ);
    //move to destination and capture rotation
    this._camera.up.setX(settings.upX);
    this._camera.up.setY(settings.upY);
    this._camera.up.setZ(settings.upZ);
    this._cadControls.target.setX(settings.targetX);
    this._cadControls.target.setY(settings.targetY);
    this._cadControls.target.setZ(settings.targetZ);
    this._camera.updateProjectionMatrix();

    this._camera.lookAt(this._cadControls.target);
    const dstRot = new Euler().copy(this._camera.rotation);

    // reset original position and rotation
    this._camera.position.set(origPosition.x, origPosition.y, origPosition.z);
    this._camera.rotation.set(origRotation.x, origRotation.y, origRotation.z);

    this._isTweening = true;
    const tweenDuration = 1200;
    //tween individually, something gets messed up when done all at once
    new TWEEN.Tween(this._camera.position)
      .to(
        {
          x: settings.cameraX,
          y: settings.cameraY,
          z: settings.cameraZ,
        },
        tweenDuration
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    new TWEEN.Tween(this._cadControls.target)
      .to(
        {
          x: settings.targetX,
          y: settings.targetY,
          z: settings.targetZ,
        },
        tweenDuration
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    new TWEEN.Tween(this._camera.up)
      .to(
        {
          x: settings.upX,
          y: settings.upY,
          z: settings.upZ,
        },
        tweenDuration
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    const qa = new Quaternion().copy(this._camera.quaternion); // src quaternion
    const qb = new Quaternion().setFromEuler(dstRot).normalize(); // dst quaternion
    const qm = new Quaternion();
    this._camera.quaternion.set(qm.x, qm.y, qm.z, qm.w).normalize();

    const o = { t: 0 };
    new TWEEN.Tween(o)
      .to({ t: 1 }, tweenDuration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        qm.slerpQuaternions(qa, qb, o.t);
        this._camera.quaternion.set(qm.x, qm.y, qm.z, qm.w).normalize();
      })
      .onComplete(() => {
        this._camera.updateProjectionMatrix();
        this._isTweening = false;
      })
      .start();
  }

  updateContainerSize(width: number, height: number) {
    this._containerWidth = width;
    if (!height) {
      height = 0;
    }
    this._containerHeight = height;

    if (this._camera && this._renderer) {
      this._renderer.setSize(this._containerWidth, this._containerHeight);
      this._camera.aspect = this._containerWidth / this._containerHeight;
      this._camera.updateProjectionMatrix();
      this._cadControls.handleResize();
    }
  }

  fitAll(node: any) {
    // Calculate bounding box of the whole scene
    const boundingBoxOfNode = new Box3().setFromObject(node);

    // Refocus camera the center of the given object
    const center = new THREE.Vector3();
    const centerOfGravity = boundingBoxOfNode.getCenter(center);
    const newCameraPosition = new Vector3();
    newCameraPosition.subVectors(centerOfGravity, this._cadControls.target);
    this._camera.position.addVectors(this._camera.position, newCameraPosition);
    this._camera.lookAt(centerOfGravity);
    this._cadControls.target.set(centerOfGravity.x, centerOfGravity.y, centerOfGravity.z);

    // Move camera along z until the object fits into the screen
    const targetSize = new THREE.Vector3();
    const sphereSize = boundingBoxOfNode.getSize(targetSize).length() * 0.5;
    const distToCenter = sphereSize / Math.sin((Math.PI / 180.0) * this._camera.fov * 0.5);
    const target = this._cadControls.target;
    const vec = new Vector3();
    vec.subVectors(this._camera.position, target);
    vec.setLength(distToCenter);
    this._camera.position.addVectors(vec, target);
  }

  private animateScene() {
    if (!this._cadControls) {
      return;
    }

    this._animationFrameId = requestAnimationFrame(this.animateScene.bind(this));
    if (this._containerHeight > 0 && this._containerWidth > 0) {
      this._cadControls.update();

      // Update ViewHelper animation if animating
      const delta = this._clock.getDelta();
      if (this._viewHelper && this._viewHelper.animating) {
        this._viewHelper.update(delta);
      }

      this.renderScene();
    }
  }

  private renderScene() {
    TWEEN.update();
    if (!this._isTweening) {
      let settingsChanged = false;
      if (this._settings.targetX.toPrecision(4) !== this._cadControls.target.x.toPrecision(4)) {
        this._settings.targetX = this._cadControls.target.x;
        settingsChanged = true;
      }
      if (this._settings.targetY.toPrecision(4) !== this._cadControls.target.y.toPrecision(4)) {
        this._settings.targetY = this._cadControls.target.y;
        settingsChanged = true;
      }
      if (this._settings.targetZ.toPrecision(4) !== this._cadControls.target.z.toPrecision(4)) {
        this._settings.targetZ = this._cadControls.target.z;
        settingsChanged = true;
      }

      if (this._settings.cameraX.toPrecision(4) !== this._camera.position.x.toPrecision(4)) {
        this._settings.cameraX = this._camera.position.x;
        settingsChanged = true;
      }
      if (this._settings.cameraY.toPrecision(4) !== this._camera.position.y.toPrecision(4)) {
        this._settings.cameraY = this._camera.position.y;
        settingsChanged = true;
      }
      if (this._settings.cameraZ.toPrecision(4) !== this._camera.position.z.toPrecision(4)) {
        this._settings.cameraZ = this._camera.position.z;
        settingsChanged = true;
      }

      if (this._settings.upX.toPrecision(4) !== this._camera.up.x.toPrecision(4)) {
        this._settings.upX = this._camera.up.x;
        settingsChanged = true;
      }
      if (this._settings.upY.toPrecision(4) !== this._camera.up.y.toPrecision(4)) {
        this._settings.upY = this._camera.up.y;
        settingsChanged = true;
      }
      if (this._settings.upZ.toPrecision(4) !== this._camera.up.z.toPrecision(4)) {
        this._settings.upZ = this._camera.up.z;
        settingsChanged = true;
      }

      if (settingsChanged) {
        this.updateSceneSettings();
      }
    }

    if (this._raycaster && this._characteristicGroup && this._cadContainer !== null) {
      if (this._mousePosition.equals(new Vector2(0, 0)) === false) {
        this._raycaster.setFromCamera(this._mousePosition, this._camera);

        const intersects = this._raycaster.intersectObjects(this._characteristicGroup.children);
        this._cadContainer.style.cursor = 'default';
        this._hoverPoint = null;
        for (let i = 0; i < intersects.length; i++) {
          this._hoverPoint = intersects[i].object.name;
          this._cadContainer.style.cursor = 'pointer';
        }
      }
    }

    if (this._renderer) {
      // Clear manually since autoClear is disabled for ViewHelper
      this._renderer.clear();
      this._renderer.render(this._scene, this._camera);

      // Render ViewHelper gizmo if visible
      if (this._viewHelper && this._viewHelperVisible) {
        this._viewHelper.render(this._renderer);
      }
    }

    this.onAfterRender?.();
  }

  updateSceneSettings = _.debounce(() => {
    if (this.onSceneSettingsChange) {
      this.onSceneSettingsChange(this._settings);
    }
  }, 500);

  updateInitialSettings() {
    this._settings0 = {} as SceneSettings;
    _.defaultsDeep(this._settings0, this._settings);
  }

  private raycastAll(onRaycast: (x: number, y: number, z: number) => void) {
    if (this._globalRaycaster == null || this._mousePosition.equals(new Vector2(0, 0))) {
      return;
    }
    this._globalRaycaster.setFromCamera(this._mousePosition, this._camera);
    const allObjects = (this._scene as Scene).children;
    const intersections = this._globalRaycaster.intersectObjects(allObjects);
    const intersection = intersections.length > 0 ? intersections[0] : null;
    if (intersection?.point) {
      const { x, y, z } = intersection.point;
      onRaycast(x, y, z);
    }
  }

  private unloadMesh(meshName: string) {
    if (!meshName || !this._scene) {
      return;
    }

    const self = this;
    const selectedObject = self._scene.getObjectByName(meshName);
    if (selectedObject !== undefined && selectedObject !== null) {
      if (selectedObject.children) {
        selectedObject.traverse(function (child: {
          material: { dispose: () => void; map: { dispose: () => void } };
          geometry: { dispose: () => void };
        }) {
          if (child.material) {
            child.material.dispose();
          }
          if (child.material && child.material.map) {
            child.material.map.dispose();
          }
          if (child.geometry) {
            child.geometry.dispose();
          }
        });
      } else {
        if (selectedObject.material) {
          selectedObject.material.dispose();
        }
        if (selectedObject.geometry) {
          selectedObject.geometry.dispose();
        }
      }

      if (this.pointCloud.contains(selectedObject)) {
        this.pointCloud.unload(selectedObject);
      } else {
        self._scene.remove(selectedObject);
      }
    }
  }

  loadFromSettings(cadSettings: CadSettings[]) {
    let cadSettingsToLoad: CadSettings[] = [];

    if (this._cadSettings) {
      //when we have loaded models, compare if any settings changed
      for (let i = 0; i < cadSettings.length; i++) {
        const newCadSettings = cadSettings[i];

        if (!newCadSettings.path || newCadSettings.path.length === 0) {
          continue;
        }

        const existingSetting = this._cadSettings.find((p) => {
          return p.path === newCadSettings.path;
        });
        if (existingSetting) {
          //path did not change, check color
          if (existingSetting.color !== newCadSettings.color) {
            //update color
            this.changeMeshColor(newCadSettings);
          }
        } else if (newCadSettings.path) {
          //add new
          cadSettingsToLoad.push(newCadSettings);
        }
      }

      //remove if no longer exists
      for (let i = 0; i < this._cadSettings.length; i++) {
        const oldCadSetting = this._cadSettings[i];
        const existingSetting = cadSettings.find((p) => {
          return p.path === oldCadSetting.path;
        });
        if (!existingSetting) {
          this.unloadMesh(oldCadSetting.path);
        }
      }
    } else {
      //load all
      cadSettingsToLoad = cadSettings;
    }

    if (cadSettingsToLoad.length > 0) {
      this.loadMeshes(cadSettingsToLoad);
    }
    this._cadSettings = _.cloneDeep(cadSettings);
  }

  private loadMeshes(cadSettings: CadSettings[]) {
    this.cadLoadingProgressCallback(0, false);

    const onObject3dLoaded: OnObject3dLoaded = (object3d, settings) => {
      object3d.name = settings.path;

      const hasDeviation = MeshLoader.getRangeFromPointCloud(object3d) !== undefined;

      if (hasDeviation) {
        this.pointCloud.addPointCloud(object3d, false);
      } else {
        if (isMesh(object3d)) {
          this.materialSetColor(object3d.material, settings.color);
        }
        this._scene?.add(object3d);
      }
    };

    new MeshLoader(
      cadSettings,
      this.cadLoadingProgressCallback,
      onObject3dLoaded,
      this.pointCloud.getRange()
    ).loadMeshes();
  }

  loadCurrentScan(path: string, onLoad: () => void) {
    const onObject3dLoaded: OnObject3dLoaded = (object3d, settings) => {
      object3d.name = settings.path;

      this.disposeCurrentScan();
      if (MeshLoader.getRangeFromPointCloud(object3d) !== undefined || isPoints(object3d)) {
        this.pointCloud.addPointCloud(object3d, true);
      }
      onLoad();
    };
    new MeshLoader(
      [{ path, color: '#00ffaa', id: hashCode(path) }],
      this.cadLoadingProgressCallback,
      onObject3dLoaded
    ).loadMeshes();
  }

  disposeCurrentScan() {
    this.pointCloud.disposeCurrentScan();
  }

  disposeSpheres() {
    if (!this._characteristicGroup) {
      return;
    }

    for (let i = this._characteristicGroup.children.length - 1; i >= 0; i--) {
      this._characteristicGroup.children[i].material.dispose();
      this._characteristicGroup.children[i].geometry.dispose();

      this._characteristicGroup.remove(this._characteristicGroup.children[i]);
    }

    this._scene.remove(this._characteristicGroup);
    this._characteristicGroup = null;
  }

  resizeFeature(size: number) {
    if (!this._characteristicGroup || !size) {
      return;
    }

    if (size) {
      const featureSize = size / 100;
      for (let i = this._characteristicGroup.children.length - 1; i >= 0; i--) {
        this._characteristicGroup.children[i].scale.set(featureSize, featureSize, featureSize);
      }

      this.tmpPoint.scale.set(featureSize, featureSize, featureSize);
    }
  }

  removeAllModels() {
    const models = this._cadSettings.slice(0);
    models.forEach((modelToRemove) => this.unloadMesh(modelToRemove.path));
  }

  removeAllSpheres() {
    for (let i = this._characteristicGroup.children.length - 1; i >= 0; i--) {
      this._characteristicGroup.children[i].material.dispose();
      this._characteristicGroup.children[i].geometry.dispose();
      this._characteristicGroup.remove(this._characteristicGroup.children[i]);
    }
  }

  private changeMeshColor(cadSettings: CadSettings) {
    const mesh = this._scene.getObjectByName(cadSettings.path);
    if (mesh === null || mesh === undefined) {
      return;
    }

    this.materialSetColor(mesh.material, cadSettings.color);
  }

  changeDefaultSphereColor(color: string) {
    if (color) {
      this._featureSettings.color = color;
    }
  }

  createMeshForCharacteristic(feature: Feature) {
    if (feature.position == null) {
      return;
    }
    const pointMaterial = new MeshLambertMaterial({ color: this._featureSettings.color });
    const sphere = new Mesh(this._sphereGeometry, pointMaterial);
    sphere.position.setX(feature.position.x);
    sphere.position.setY(feature.position.y);
    sphere.position.setZ(feature.position.z);
    sphere.name = feature.uid;
    sphere.scale.set(
      this._featureSettings.size / 100,
      this._featureSettings.size / 100,
      this._featureSettings.size / 100
    );
    return sphere;
  }

  loadFeatures(features: Feature[]) {
    const featuresToLoad = _.cloneDeep(features);

    this.removeAllSpheres();
    if (featuresToLoad.length > 0) {
      for (let i = 0; i < featuresToLoad.length; i++) {
        const characteristicMesh = this.createMeshForCharacteristic(featuresToLoad[i]);
        if (characteristicMesh != null) {
          this._characteristicGroup.add(characteristicMesh);
        }
      }
      this._characteristicGroup.updateMatrixWorld(true);
    }
  }

  removeSphere(pointName: string) {
    const selectedPoint = this._scene.getObjectByName(pointName);
    if (selectedPoint === null || selectedPoint === undefined) {
      return;
    }

    selectedPoint.material.dispose();
    selectedPoint.geometry.dispose();
    this._characteristicGroup.remove(selectedPoint);
  }

  updateFeatureSettings(featureModels: FeatureModel[], featureSettings: FeatureSettings) {
    const diff: Partial<FeatureSettings> = objectDiff(this._featureSettings, featureSettings);
    const newSize = diff?.size;

    this._featureSettings = { ...featureSettings };

    if (newSize) {
      this.resizeFeature(this._featureSettings.size);
    }

    for (const fm of featureModels) {
      const color = fm.computed.color;
      const uid = fm.feature.uid;
      if (color) {
        this.updateSphereColor(uid, color);
      } else {
        this.resetSphereColor(uid);
      }
    }
  }

  updateSphereColor(uid: string, colorHex: string | undefined) {
    if (this._scene == null) {
      return;
    }
    const mesh = this._scene.getObjectByName(uid);
    if (mesh === null || mesh === undefined) {
      return;
    }

    this.materialSetColor(mesh.material, colorHex ?? this._featureSettings.color);
  }

  resetColorOfAllSpheres() {
    const allFeatures = this._characteristicNamesArray.slice(0);

    allFeatures.forEach((element) => {
      this.resetSphereColor(element);
    });
  }

  resetSphereColor(featureName: string) {
    const selectedPoint = this._scene.getObjectByName(featureName);
    if (selectedPoint === null || selectedPoint === undefined) {
      return;
    }
    this.materialSetColor(selectedPoint.material, this._featureSettings.color);
  }

  dispose() {
    cancelAnimationFrame(this._animationFrameId);
    if (this._cadContainer !== null) {
      this._cadContainer.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
      this._cadContainer.removeEventListener('mouseup', this.onMouseUp.bind(this), false);
      this._cadContainer.removeEventListener('mousedown', this.onMouseDown.bind(this), false);
      this._cadContainer.removeEventListener('mouseenter', this.onMouseEnter.bind(this), false);
      this._cadContainer.removeEventListener('mouseleave', this.onMouseLeave.bind(this), false);
    }

    // Remove ViewHelper click handler
    if (this._renderer && this._viewHelperClickHandler) {
      this._renderer.domElement.removeEventListener('pointerup', this._viewHelperClickHandler);
      this._viewHelperClickHandler = null;
    }
    this.disposeSpheres();
    this.removeAllModels();

    if (this._sphereGeometry) {
      this._sphereGeometry.dispose();
    }

    this._sphereGeometry = null;

    if (this._renderer) {
      this._renderer.dispose();
    }

    this._renderer = null;
    this._raycaster = undefined;
    this._mousePosition = null;
    this._camera = null;

    if (this._cadControls) {
      this._cadControls.dispose();
    }

    this._cadControls = null;
    this._scene = null;
    this._viewHelper = null;

    if (this._viewHelperContainer && this._cadContainer) {
      this._cadContainer.removeChild(this._viewHelperContainer);
    }
    this._viewHelperContainer = null;
  }

  getMeshForFeature(uid: string): Mesh {
    return this._characteristicGroup.getObjectByName(uid);
  }

  getAllCharacteristicMeshes(): Mesh[] {
    return this._characteristicGroup?.children ?? [];
  }
  getCamera(): Camera {
    return this._camera;
  }

  setCadContainer(cadContainer: HTMLDivElement) {
    this._cadContainer = cadContainer;
  }

  setFeatureSettings(value: FeatureSettings) {
    const diff: Partial<FeatureSettings> = objectDiff(this._featureSettings, value);
    const newColor = diff?.color;
    const newSize = diff?.size;

    if (!newColor && !newSize) {
      return;
    }

    this._featureSettings = value;
    const group = this._characteristicGroup as Group;
    const newMaterial = newColor ? new MeshLambertMaterial({ color: newColor }) : undefined;
    for (const el of group.children) {
      if (newSize) {
        el.scale.set(newSize / 100, newSize / 100, newSize / 100);
      }

      if (el.type === 'Mesh' && newMaterial) {
        const mesh = el as Mesh;
        mesh.material = newMaterial;
      }
    }
    this._characteristicGroup.updateMatrixWorld(true);
  }

  materialSetColor(material: THREE.Material | THREE.Material[], color: string) {
    if (Array.isArray(material)) {
      material.forEach((m) => this.materialSetColor(m, color));
      return;
    }

    const set = (color: string, opacity: number, transparent = false) => {
      material.transparent = transparent;
      material.opacity = opacity;
      if (isMeshLambertMaterial(material) || isMeshStandardMaterial(material)) {
        material.color.set(color);
      }
    };

    const isHexWithAlpha = /^#[0-9A-Za-z]{8}$/.test(color);
    if (isHexWithAlpha) {
      const colorStr = color.slice(0, 7);
      const alphaStr = color.slice(7);
      const alpha = parseInt(alphaStr, 16) / 255.0;

      set(colorStr, alpha, true);
    } else {
      set(color, 1.0);
    }
  }

  setPointCloudRange(range: number) {
    this.pointCloud.setRange(range);
  }

  showTmpPoint(x: number, y: number, z: number) {
    this.tmpPoint.position.set(x, y, z);
    if (this.tmpPoint.parent == null) {
      this._scene.add(this.tmpPoint);
    }
  }

  hideTmpPoint() {
    if (this.tmpPoint.parent != null) {
      this._scene.remove(this.tmpPoint);
    }
  }

  showViewHelper() {
    this._viewHelperVisible = true;
  }

  hideViewHelper() {
    this._viewHelperVisible = false;
  }
}

//calc zeby wszytko ladnie zmiescic
//http://stackoverflow.com/questions/17558085/three-js-orthographic-camera

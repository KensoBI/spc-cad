import { Camera, Group, Mesh, MeshLambertMaterial, Object3D, Raycaster, Scene, SphereGeometry, Vector2 } from 'three';
import { SetPointCloudModeCallback } from 'types/CadPanelOptions';
import { isMesh, isMeshLambertMaterial, isPoints } from './typeCheckers';
import { MeshLoader } from './MeshLoader';
import { gradientColors } from './gradientColors';

export default class PointCloud {
  private pointCloudGroup: Group;
  private scanGroup: Group;
  private sphere: Mesh;
  private raycaster: Raycaster;
  private range?: number;

  private setPointCloudMode: SetPointCloudModeCallback;

  constructor(setPointCloudMode: SetPointCloudModeCallback) {
    this.setPointCloudMode = setPointCloudMode;

    this.pointCloudGroup = new Group();
    this.scanGroup = new Group();

    //create sphere for highlighting the hovered point
    const sphereGeometry = new SphereGeometry(1.0, 32, 32);
    const sphereMaterial = new MeshLambertMaterial({ color: 0xff0000 });
    this.sphere = new Mesh(sphereGeometry, sphereMaterial);

    this.raycaster = new Raycaster();
    this.raycaster.params.Points = {
      threshold: 1,
    };
  }

  initializeScene(scene: Scene) {
    scene.add(this.pointCloudGroup);
    scene.add(this.scanGroup);
  }

  addPointCloud(pointCloud: Object3D, isScan: boolean) {
    this.range = MeshLoader.getRangeFromPointCloud(pointCloud);
    this.setPointCloudMode((prev) => ({
      ...prev,
      enabled: true,
      range: this.range,
    }));
    const group = isScan ? this.scanGroup : this.pointCloudGroup;
    group.add(pointCloud);
  }

  raycast(mousePosition: Vector2, camera: Camera, scene: Scene) {
    if (mousePosition.equals(new Vector2(0, 0))) {
      return;
    }
    this.raycaster.setFromCamera(mousePosition, camera);
    const objects = [...this.pointCloudGroup.children, ...this.scanGroup.children];
    const intersections = this.raycaster.intersectObjects(objects, false);
    const intersection = intersections.length > 0 ? intersections[0] : null;

    if (intersection === null || (!isPoints(intersection.object) && !isMesh(intersection.object))) {
      return;
    }

    const attrs = intersection.object.geometry.attributes;

    if (attrs.deviation == null) {
      return;
    }

    const index = intersection.index ?? intersection.face?.a;

    const deviation = attrs.deviation.array[index!];

    this.setPointCloudMode((prev) => ({
      ...prev,
      currentValue: deviation,
    }));

    this.sphere.position.copy(intersection.point);
    if (this.range != null && isMeshLambertMaterial(this.sphere.material)) {
      this.sphere.material.color = gradientColors(deviation, this.range);
    }

    if (this.sphere.parent === null) {
      scene.add(this.sphere);
    }
  }

  contains(object: Object3D) {
    return this.pointCloudGroup.children.includes(object);
  }

  unload(selectedObject: Object3D) {
    this.pointCloudGroup?.remove(selectedObject);
    if (this.pointCloudGroup?.children.length === 0) {
      this.setPointCloudMode({
        enabled: false,
        range: undefined,
        currentValue: undefined,
      }); //disable pointCloud mode if no more point clouds
    }
  }

  hideSelectedPoint() {
    if (this.sphere.parent !== null) {
      this.setPointCloudMode((prev) => ({
        ...prev,
        currentValue: undefined,
      }));
      this.sphere.parent.remove(this.sphere);
    }
  }

  setRange(range: number) {
    this.range = range;
  }
  getRange() {
    return this.range;
  }

  disposeCurrentScan() {
    if (this.scanGroup.children.length > 0) {
      this.scanGroup.children.forEach((child) => {
        this.scanGroup.remove(child);
      });
    }
    this.hideSelectedPoint();
  }
}

import { CadSettings, FeatureOverridesMap, FeatureSettings, SceneSettings } from 'types/CadSettings';
import { AnnotationSettings, AnnotationTemplate } from './Annotation';
import { PointCloudState } from 'components/pointCloudState';

//type SeriesSize = 'sm' | 'md' | 'lg';
export type SceneSettingsActionCallback = (state: SceneSettings) => void;
export type CadLoadingProgressCallback = (loaded: number, finished: boolean, errors?: string[]) => void;
export type SetPointCloudModeCallback = React.Dispatch<React.SetStateAction<PointCloudState>>;

export type CadPanelOptions = {
  boxTemplates?: AnnotationTemplate[];
  annotations?: AnnotationSettings[];
  sceneSettings: SceneSettings;
  cadSettings: CadSettings[];
  featureSettings: FeatureSettings;
  featureOverrides?: FeatureOverridesMap;
};

export const defaults: CadPanelOptions = {
  boxTemplates: [],
  annotations: [],
  sceneSettings: {
    cameraX: 0,
    cameraY: 0,
    cameraZ: 2500,
    targetX: 0,
    targetY: 0,
    targetZ: 0,
    upX: 0,
    upY: 1,
    upZ: 0,
  },
  cadSettings: [],
  featureSettings: {
    size: 7,
    color: '#4285f4',
  },
};

import React from 'react';
import { css } from 'emotion';
import { Mesh } from 'three';
import SceneViewModel from 'components/Scene/SceneViewModel';
import { AnnotationSettings } from 'types/Annotation';
import { Annotations } from 'components/Annotations/Annotations';
import { usePanelContext, useStyles2 } from '@grafana/ui';

import { CadPanelProps } from 'types/CadPanelProps';
import { Scene } from 'components/Scene/Scene';
import { parseData } from 'feature/data/parseData';
import { PanelPropsProvider } from 'utils/PanelPropsProvider';
import { getFeatureModels } from 'feature/data/generateFeatureModels';
import { SceneViewModelProvider } from 'components/Scene/SceneViewModelProvider';
import { useGetTemplateModels } from 'templates/useGetTemplateModels';
import { TemplateModelsProvider } from 'templates/TemplateModelsProvider';
import { getAvailableColumns } from 'feature/data/getAvailableColumns';
import { CadLoadingProgressCallback } from 'types/CadPanelOptions';
import { usePointCloudState } from 'components/pointCloudState';
import { transferableFeature } from 'types/Feature';

export function CadPanel(props: CadPanelProps) {
  const { width, height, data, options, onOptionsChange } = props;
  const { annotations, boxTemplates } = options;
  const styles = useStyles2(getStyles);
  const [cadLoaded, setCadLoaded] = React.useState<boolean>(false);
  const [loadProgress, setLoadProgress] = React.useState<number>(0);
  const [pointCloud, setPointCloud] = usePointCloudState();

  const context = usePanelContext();

  const sceneViewModel = React.useMemo(
    () => {
      const loadProgress: CadLoadingProgressCallback = (loaded, finished, errors) => {
        setCadLoaded(finished);
        setLoadProgress(loaded);
      };
      return new SceneViewModel(options.sceneSettings, options.featureSettings, loadProgress, setPointCloud);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { features, cadDsEntities, scansTimeline, unpositionedFeatures } = React.useMemo(
    () => parseData(data.series, options.featureOverrides ?? {}),
    [data.series, options.featureOverrides]
  );
  const templateModels = useGetTemplateModels(boxTemplates);

  const featureModels = React.useMemo(
    () => getFeatureModels(features, annotations ?? [], templateModels ?? []),
    [annotations, templateModels, features]
  );
  const availableColumns = React.useMemo(() => getAvailableColumns(featureModels), [featureModels]);

  //sync instance state to be available for options editor via 'context.instanceState'
  const onInstanceStateChange = context.onInstanceStateChange;
  React.useEffect(() => {
    onInstanceStateChange?.({
      scene: sceneViewModel,
      onOptionsChange,
      unpositionedFeatures: unpositionedFeatures.map((f) => transferableFeature(f)),
    });
  }, [onInstanceStateChange, onOptionsChange, sceneViewModel, unpositionedFeatures]);

  React.useEffect(() => {
    sceneViewModel.updateFeatureSettings(featureModels, options.featureSettings);
  }, [featureModels, options.featureSettings, sceneViewModel]);

  React.useEffect(() => {
    sceneViewModel.onSceneSettingsChange = (sceneSettings) => {
      onOptionsChange({
        ...options,
        sceneSettings,
      });
    };
  }, [onOptionsChange, options, sceneViewModel]);

  React.useEffect(() => {
    sceneViewModel.onMeshClicked = (uid: string, parentMesh: Mesh) => {
      const annotationExist = annotations?.find((p) => p.uid === uid);

      if (annotationExist) {
        console.info('clicked on existing feature');
        annotationExist.display = 'label';
        onOptionsChange({
          ...options,
          annotations: [...(annotations ?? [])],
        });
        return;
      }

      const feature = features.find((p) => p.uid === uid);
      if (!feature) {
        console.warn('Clicked on stale feature.');
        return;
      }

      const annotation: AnnotationSettings = {
        uid: uid,
        display: 'label',
        isEditing: false,
        titleColumn: feature.id,
      };

      onOptionsChange({
        ...options,
        annotations: [...(annotations ?? []), annotation],
      });
    };
  }, [annotations, data.series, features, height, onOptionsChange, options, sceneViewModel, width]);

  return (
    <PanelPropsProvider panelProps={props}>
      <SceneViewModelProvider sceneViewModel={sceneViewModel}>
        <TemplateModelsProvider
          templateModels={templateModels}
          featureModels={featureModels}
          availableColumns={availableColumns}
        >
          <Annotations featureModels={featureModels} />
          <Scene
            sceneViewModel={sceneViewModel}
            cadSettings={options.cadSettings}
            features={features}
            cadDsEntities={cadDsEntities}
            pointCloud={pointCloud}
            scansTimeline={scansTimeline}
          />
          <div className={styles.progressBar}>
            <span className={cadLoaded ? styles.fadeOut : styles.fadeIn}>
              <span className={styles.progress} style={{ width: loadProgress * 100 + '%' }}></span>
            </span>
          </div>
        </TemplateModelsProvider>
      </SceneViewModelProvider>
    </PanelPropsProvider>
  );
}

const getStyles = () => {
  return {
    progress: css`
      background: #75b800;
      color: #fff;
      height: 1.5px;
      width: 0;
      display: block;
      transition: all 100ms ease;
      transition-property: width;
    `,
    progressBar: css`
      left: 50%;
      border-radius: 60px;
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      position: absolute;
      top: 0;
      transform: translate3d(-50%, -50%, 0);
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
    fadeOut: css`
      opacity: 0;
      transition: opacity 1.5s;
    `,
    fadeIn: css`
      opacity: 1;
      transition: opacity 1.5s;
    `,
  };
};

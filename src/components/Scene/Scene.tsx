import React from 'react';
import { CadDsEntity, CadSettings, ScanItem } from 'types/CadSettings';
import { Feature } from 'types/Feature';
import { useStyles2 } from '@grafana/ui';
import SceneViewModel from './SceneViewModel';
import { usePanelSize } from 'utils/usePanelSize';
import { DEFAULT_CAD_COLOR } from 'constants/global';
import { unionBy } from 'lodash';
import { hashCode } from 'utils/hashCode';
import { css } from 'emotion';
import { GradientLegend } from './GradientLegend';
import { PointCloudState } from 'components/pointCloudState';
import { Scans } from './Scans';

type Props = {
  sceneViewModel: SceneViewModel | undefined;
  features: Feature[];
  cadSettings: CadSettings[];
  cadDsEntities: CadDsEntity[];
  pointCloud: PointCloudState;
  scansTimeline: ScanItem[];
};

export function Scene({ features, sceneViewModel, cadSettings, cadDsEntities, pointCloud, scansTimeline = [] }: Props) {
  const styles = useStyles2(getStyles);
  const { width, height } = usePanelSize();
  const canvasRef = React.useRef<HTMLDivElement | null>(null);

  if (sceneViewModel == null) {
    throw new Error('Scene View Model not set!');
  }

  React.useEffect(() => {
    if (canvasRef.current) {
      sceneViewModel.setCadContainer(canvasRef.current);
    }
  }, [sceneViewModel]);

  React.useEffect(() => {
    sceneViewModel.updateContainerSize(width, height);
  }, [height, sceneViewModel, width]);

  React.useEffect(() => {
    sceneViewModel.initialize();
    return () => {
      sceneViewModel?.dispose();
    };
  }, [sceneViewModel]);

  const cadSettingsFromCadDs: CadSettings[] = React.useMemo(() => {
    return cadDsEntities.map((el) => ({
      path: el.path,
      color: el.color ?? DEFAULT_CAD_COLOR,
      id: hashCode(el.path),
    }));
  }, [cadDsEntities]);

  React.useEffect(() => {
    //https://cdn.kensobi.com/tesla-modelx/98112587_Front_Bumper.stl
    //https://cdn.kensobi.com/tesla-modelx/Left_Fender_2.stl

    sceneViewModel.loadFromSettings(unionBy(cadSettings, cadSettingsFromCadDs, (cs) => cs.id));
  }, [cadSettings, cadSettingsFromCadDs, sceneViewModel]);

  React.useEffect(() => {
    sceneViewModel.loadFeatures(features);
  }, [features, sceneViewModel]);

  return (
    <>
      <div ref={canvasRef}></div>
      {pointCloud.enabled && pointCloud.range != null && (
        <GradientLegend range={pointCloud.range} currentValue={pointCloud.currentValue} />
      )}
      <Scans scansTimeline={scansTimeline} sceneViewModel={sceneViewModel} />
      <div className={styles.progressBar}>
        <span>
          <span className={styles.progress}></span>
        </span>
      </div>
    </>
  );
}

const getStyles = () => ({
  scene: css`
    position: relative;
    width: 100%;
  `,
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
  gridPanel: css`
    position: absolute;
    pointer-events: none;
  `,
});

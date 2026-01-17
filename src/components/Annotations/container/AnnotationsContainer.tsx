import React from 'react';
import { Windows } from './Windows';
import { usePanelSize } from 'utils/usePanelSize';
import { AutoPositionerEngine, AutoPositionerContext } from './AutoPositioner';
import { LabelContainer } from './LabelContainer';
import RGL, { Layout as GridLayout } from 'react-grid-layout';
import { LineContainerRefProvider } from './useLine';
import { useSceneViewModel } from 'components/Scene/SceneViewModelProvider';
import { WindowProps } from '../window/Window';
import { LabelProps } from '../label/Label';

function useOnPanelResize(engine: AutoPositionerEngine) {
  const { width, height } = usePanelSize();

  React.useEffect(() => {
    engine.onPanelResize({ width, height });
  }, [width, height, engine]);
}

function useSetSceneViewModel(engine: AutoPositionerEngine) {
  const sceneViewModel = useSceneViewModel();
  React.useEffect(() => {
    engine.sceneViewModel = sceneViewModel;
  }, [engine, sceneViewModel]);
}

function useRequestAnimationFrame(engine: AutoPositionerEngine) {
  React.useEffect(() => {
    let frame: number | undefined = undefined;
    const animate = () => {
      engine.updatePosition();
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [engine]);
}

type AnnotationsProviderProps = React.PropsWithChildren<{
  labels: Array<React.ReactElement<LabelProps>>;
  windows: Array<React.ReactElement<WindowProps>>;
  layout: GridLayout[];
  onLayoutChange: (layout: RGL.Layout[]) => void;
}>;

export function AnnotationsContainer({ labels, windows, layout, onLayoutChange }: AnnotationsProviderProps) {
  const engine = React.useRef(new AutoPositionerEngine());
  const linesContainerRef = React.useRef<HTMLDivElement | null>(null);

  useOnPanelResize(engine.current);
  useSetSceneViewModel(engine.current);
  useRequestAnimationFrame(engine.current);

  return (
    <AutoPositionerContext.Provider value={engine}>
      <LineContainerRefProvider lineContainer={linesContainerRef}>
        <div style={{ position: 'relative' }} ref={linesContainerRef}>
          <Windows layout={layout} onLayoutChange={onLayoutChange} elements={windows} />
          {labels.map((el) => (
            <LabelContainer lineColor={el.props.color} uid={`${el.key}`} key={`label-${el.key}`}>
              {el}
            </LabelContainer>
          ))}
        </div>
      </LineContainerRefProvider>
    </AutoPositionerContext.Provider>
  );
}

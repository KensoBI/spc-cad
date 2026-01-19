import React from 'react';
import _ from 'lodash';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import { css } from '@emotion/css';

// Cast to work around type incompatibility between @types/react-grid-layout and React 18
const GridLayout = ReactGridLayout as unknown as React.ComponentType<ReactGridLayout.ReactGridLayoutProps>;
import { useStyles2 } from '@grafana/ui';
import { useAutoPositioner } from './AutoPositioner';
import { useLine } from './useLine';
import { usePanelSize } from 'utils/usePanelSize';
import { useParentBoxObserver } from 'utils/useParentBoxObserver';
import { LAYOUT_GRID_CELL_HEIGHT, LAYOUT_GRID_CELL_VMARGIN, LAYOUT_GRID_COLUMN_COUNT } from 'constants/global';
import { GrafanaTheme2 } from '@grafana/data';
import { WindowProps } from '../window/Window';
import { useEditedWindow } from 'templates/TemplateModelsProvider';

const WindowSizeContext = React.createContext({ width: 0, height: 0 });

export function useWindowSize() {
  return React.useContext(WindowSizeContext);
}

type WindowContainerProps = {
  uid: string;
  color?: string;
};

function WindowContainer({ children, color, uid }: React.PropsWithChildren<WindowContainerProps>) {
  const styles = useStyles2(getStyles);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const engine = useAutoPositioner();
  const { linePortalNode, onChange: onChangeLine } = useLine(color);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const eng = engine.current;
    eng.registerBox(uid, true, onChangeLine);
    return () => {
      eng.removeBox(uid);
    };
  }, [engine, onChangeLine, uid]);

  useParentBoxObserver(
    React.useCallback(
      (x, y, width, height) => {
        const newSize = { width, height };
        if (engine.current.onBoxResize(uid, newSize) === true) {
          setSize(newSize);
        }
        engine.current.onBoxMove(uid, x, y);
      },
      [engine, uid]
    ),
    ref
  );

  return (
    <WindowSizeContext.Provider value={size}>
      {linePortalNode}
      <div ref={ref} className={styles.windowContainer}>
        {children}
      </div>
    </WindowSizeContext.Provider>
  );
}

type WindowsProps = {
  elements: Array<React.ReactElement<WindowProps>>;
  layout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
};

export function Windows({ elements, layout, onLayoutChange }: WindowsProps) {
  const styles = useStyles2(getStyles);
  const { width, height } = usePanelSize();
  const [_, setEditedWindow] = useEditedWindow();
  return (
    <GridLayout
      style={{ position: 'absolute', height, pointerEvents: 'none' }}
      layout={layout}
      containerPadding={[0, 0]}
      useCSSTransforms={true}
      margin={[LAYOUT_GRID_CELL_VMARGIN, LAYOUT_GRID_CELL_VMARGIN]}
      cols={LAYOUT_GRID_COLUMN_COUNT}
      rowHeight={LAYOUT_GRID_CELL_HEIGHT}
      compactType={null}
      onLayoutChange={onLayoutChange}
      onDrag={() => setEditedWindow(undefined)}
      onResize={() => setEditedWindow(undefined)}
      draggableHandle=".box-drag-handle"
      draggableCancel=".no-drag"
      width={width}
    >
      {elements.map((el) => (
        <div className={styles.gridElement} key={el.key}>
          <WindowContainer uid={`${el.key}`} color={el.props.featureModel.computed.color}>
            {el}
          </WindowContainer>
        </div>
      ))}
    </GridLayout>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    gridElement: css`
      background-color: ${theme.colors.background.primary};
      height: 100%;
      width: 100%;
      position: absolute;
      margin-top: 0;
      margin-left: 0;
      border-radius: 3px;
      min-width: 20px;
      pointer-events: auto;
      z-index: 2;
      overflow: hidden;

      .panel-in-fullscreen & {
        display: block !important;
        transition-property: inherit !important;
      }
    `,
    windowContainer: css``,
  };
};

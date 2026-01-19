import React from 'react';
import { useStyles2 } from '@grafana/ui';
import { css } from 'emotion';
import { createPortal } from 'react-dom';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { PRINT_COLOR_ADJUST } from 'constants/global';
import { GrafanaTheme2 } from '@grafana/data';

const Context = React.createContext<React.MutableRefObject<HTMLDivElement | null>>({ current: null });

export function LineContainerRefProvider({
  children,
  lineContainer,
}: React.PropsWithChildren<{ lineContainer: React.MutableRefObject<HTMLDivElement | null> }>) {
  return <Context.Provider value={lineContainer}>{children}</Context.Provider>;
}

export function useLine(color?: string) {
  const styles = useStyles2(getStyles);
  const lineRef = React.useRef<HTMLDivElement>(null);
  const { options } = usePanelProps();
  const defaultColor = options.featureSettings.color;

  const onChange = React.useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const line = lineRef.current;
    if (!line) {
      return;
    }

    const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const hidden = (x1 === 0 && y1 === 0) || (x2 === 0 && y2 === 0) || length === 0;

    line.style.transform = `rotate(${angle}deg)`;
    line.style.width = `${length}px`;
    line.style.top = `${y1}px`;
    line.style.left = `${x1}px`;
    line.style.opacity = hidden ? '0' : '1';
    line.style.display = hidden ? 'none' : 'block';
  }, []);

  const wrapperElement = React.useContext(Context);

  return {
    linePortalNode:
      wrapperElement.current != null
        ? createPortal(
            <div ref={lineRef} className={styles.line} style={{ backgroundColor: color ?? defaultColor }} />,
            wrapperElement.current
          )
        : null,
    onChange,
  };
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    line: css`
      opacity: 0;
      position: absolute;
      transform-origin: 0 100%;
      height: 2px;
      border: 0;
      z-index: 0;
      transition: opacity 1s;
      border-radius: 1px;
      ${PRINT_COLOR_ADJUST}
    `,
  };
};

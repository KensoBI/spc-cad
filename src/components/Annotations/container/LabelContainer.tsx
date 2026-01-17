import React from 'react';
import { createCSSTransform } from 'utils/domFns';
import { useSize } from 'utils/useSize';
import { css } from 'emotion';
import { useStyles2 } from '@grafana/ui';
import { useLine } from './useLine';
import { useAutoPositioner } from './AutoPositioner';

export type FloatingBoxProps = React.PropsWithChildren<{
  uid: string;
  lineColor?: string;
}>;

export function LabelContainer({ uid, lineColor, children }: FloatingBoxProps) {
  const engine = useAutoPositioner();
  const styles = useStyles2(getStyles);
  const { linePortalNode, onChange: onChangeLine } = useLine(lineColor);

  const onResize = React.useCallback(
    (width: number, height: number) => {
      engine.current.onBoxResize(uid, { width, height });
    },
    [engine, uid]
  );

  const containerRef = useSize(onResize);
  React.useEffect(() => {
    const eng = engine.current;
    const container = containerRef.current;

    const onPositionChange = (x: number, y: number) => {
      const trans = createCSSTransform({ x, y }, null);
      Object.entries(trans).forEach(([key, value]) => {
        container?.style.setProperty(key, value);
      });
    };

    eng.registerBox(uid, false, onChangeLine, onPositionChange);

    setTimeout(() => {
      container?.style.setProperty('opacity', '1');
      container?.style.setProperty('transition', 'all 50ms ease');
    }, 100);

    return () => {
      eng.removeBox(uid);
    };
  }, [containerRef, engine, onChangeLine, uid]);

  return (
    <>
      {linePortalNode}
      <div className={styles.container} ref={containerRef}>
        {children}
      </div>
    </>
  );
}
const getStyles = () => {
  return {
    container: css`
      opacity: 0;
      width: auto;
      height: auto;
      position: absolute;
      border: 0;
      z-index: 2;
    `
  };
};

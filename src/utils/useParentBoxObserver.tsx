import React from 'react';

export type OnBoxChange = (x: number, y: number, width: number, height: number) => void;

export function useParentBoxObserver(
  onChange: OnBoxChange,
  nodeRef: React.MutableRefObject<HTMLElement | undefined | null>
) {
  const observerRef = React.useRef<MutationObserver | null>(null);
  const prevStampRef = React.useRef<string>('');

  React.useEffect(() => {
    const node = nodeRef.current;
    if (node == null) {
      return;
    }

    const parent = node.parentElement;
    if (parent == null) {
      return;
    }

    const emitValues = () => {
      const width = parseInt(parent.style.width, 10);
      const height = parseInt(parent.style.height, 10);
      const { m41: x, m42: y } = new WebKitCSSMatrix(parent.style.transform);
      const stamp = [width, height, x, y].join('-');
      if (prevStampRef.current !== stamp) {
        onChange(x, y, width, height);
      }
      prevStampRef.current = stamp;
    };

    emitValues(); //initial condition

    observerRef.current = new MutationObserver(function (mutations) {
      mutations.forEach(() => {
        emitValues()
      });
    });

    const observer = observerRef.current;
    observer.observe(parent, { attributes: true, attributeFilter: ['style'] });
    return () => {
      observer.disconnect();
    };
  }, [nodeRef, onChange]);
}

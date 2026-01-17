import React from 'react';

export function useSize(onResize?: (width: number, height: number) => void) {
  const container = React.useRef<HTMLDivElement | null>(null);

  const [dimX, setDimX] = React.useState<number | undefined>();
  const [dimY, setDimY] = React.useState<number | undefined>();

  React.useEffect(() => {
    if (dimX == null || dimY == null || onResize == null) {
      return;
    }
    onResize(dimX, dimY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimX, dimY]);

  React.useEffect(() => {
    const element = container.current;
    if (element == null) {
      return;
    }
    const handle = () => {
      const defaultView = element.ownerDocument.defaultView;
      if (!defaultView) {
        return;
      }

      const computedStyle = defaultView.getComputedStyle(element);
      if (!computedStyle) {
        return;
      }

      let newHeight = element.clientHeight;
      newHeight += parseInt(computedStyle.borderTopWidth, 10);
      newHeight += parseInt(computedStyle.borderBottomWidth, 10);

      let newWidth = element.clientWidth;
      newWidth += parseInt(computedStyle.borderLeftWidth, 10);
      newWidth += parseInt(computedStyle.borderRightWidth, 10);

      setDimX(newWidth);
      setDimY(newHeight);
    };
    handle();
    element.addEventListener('resize', handle);

    return () => {
      element.removeEventListener('resize', handle);
    };
  }, []);

  return container;
}

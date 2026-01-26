import React from 'react';
import { createPortal } from 'react-dom';

export function useDraggableInPortal() {
  const self = React.useRef<any>({}).current;

  React.useEffect(() => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.pointerEvents = 'none';
    div.style.top = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    self.elt = div;
    document.body.appendChild(div);
    return () => {
      document.body.removeChild(div);
    };
  }, [self]);

  return (render: any) =>
    (provided: any, ...args: any) => {
      const element = render(provided, ...args);
      if (provided.draggableProps.style.position === 'fixed') {
        return createPortal(element, self.elt);
      }
      return element;
    };
}

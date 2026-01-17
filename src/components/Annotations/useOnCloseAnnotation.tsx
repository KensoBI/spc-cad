import React from 'react';
import { usePanelProps } from 'utils/PanelPropsProvider';

export function useOnCloseAnnotation(uid: string) {
  const { options, onOptionsChange } = usePanelProps();

  return React.useCallback(() => {
    const an = options.annotations?.find((an) => an.uid === uid);
    if (!an || options.annotations == null) {
      return;
    }
    an.gridPos = undefined;
    an.display = 'hide';
    options.annotations = [...options.annotations];
    onOptionsChange(options);
  }, [onOptionsChange, options, uid]);
}

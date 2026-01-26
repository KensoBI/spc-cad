import React from 'react';
import { usePanelProps } from 'utils/PanelPropsProvider';

export function useOnCloseAnnotation(uid: string, positionMode?: string) {
  const { options, onOptionsChange } = usePanelProps();

  return React.useCallback(() => {
    const an = options.annotations?.find((an) => an.uid === uid);
    if (!an || options.annotations == null) {
      return;
    }
    an.gridPos = undefined;
    an.display = 'hide';

    // For unpositioned features (noPosition), remove the feature override
    // so they return to the Unpositioned Features list
    let featureOverrides = options.featureOverrides;
    if (positionMode === 'noPosition' && featureOverrides && featureOverrides[uid]) {
      const { [uid]: _, ...rest } = featureOverrides;
      featureOverrides = Object.keys(rest).length > 0 ? rest : undefined;
    }

    onOptionsChange({
      ...options,
      annotations: [...options.annotations],
      featureOverrides,
    });
  }, [onOptionsChange, options, uid, positionMode]);
}

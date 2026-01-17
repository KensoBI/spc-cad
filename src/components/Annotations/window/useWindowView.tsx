import React from 'react';
import { AnnotationSettings } from 'types/Annotation';
import { usePanelProps } from 'utils/PanelPropsProvider';

export function useWindowViewValue(current: AnnotationSettings) {
  return React.useMemo(() => current.activeViewId ?? undefined, [current.activeViewId]);
}

export function useWindowView(current: AnnotationSettings): [string | undefined, (newId: string) => void] {
  const { options, onOptionsChange } = usePanelProps();
  const activeViewId = useWindowViewValue(current);
  const setViewId = React.useCallback(
    (viewId: string) => {
      const an = options.annotations?.find((an) => an.uid === current.uid);
      if (!an || options.annotations == null) {
        return;
      }
      an.activeViewId = viewId;
      options.annotations = [...options.annotations];
      onOptionsChange(options);
    },
    [current.uid, onOptionsChange, options]
  );
  return [activeViewId, setViewId];
}

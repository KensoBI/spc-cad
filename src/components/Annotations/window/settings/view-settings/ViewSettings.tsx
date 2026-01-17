import React from 'react';
import { ViewsDragAndDrop } from './views-dnd/ViewsDragAndDrop';
import { useEditedViewComponent } from './EditedViewComponentProvider';
import { ViewEditor } from './ViewComponentEditor';
import { CurrentViewComponentProvider } from './CurrentViewComponentProvider';
import { useFocusedViewSetters } from '../../FocusProvider';

export function ViewSettings() {
  const { ids } = useEditedViewComponent();

  useCleanupFocus();

  return (
    <>
      {ids == null ? (
        <ViewsDragAndDrop />
      ) : (
        <CurrentViewComponentProvider>
          <ViewEditor />
        </CurrentViewComponentProvider>
      )}
    </>
  );
}

function useCleanupFocus() {
  const { setFocuseViewComponentId, setFocusedViewItemId } = useFocusedViewSetters();
  React.useEffect(() => {
    return () => {
      setFocusedViewItemId(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    return () => {
      setFocuseViewComponentId(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

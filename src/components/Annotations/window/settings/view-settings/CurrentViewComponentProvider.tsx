import { Alert } from '@grafana/ui';
import React from 'react';
import { ViewComponent } from 'types/ViewComponentSettings';
import { useTemplateSettings } from '../TemplateSettings';
import { useFindViewComponentByIndexes, useSetViewComponent } from '../useUpdateAnnotationTemplate';
import { useCurrentViewComponentIndexes, useEditedViewComponent } from './EditedViewComponentProvider';

type ContextType = {
  viewComponent: ViewComponent;
  setViewComponent: (value: ViewComponent) => void;
};
const Context = React.createContext<ContextType>({} as ContextType);

export function useCurrentViewComponentProvider() {
  return React.useContext(Context);
}

export function CurrentViewComponentProvider({ children }: React.PropsWithChildren<{}>) {
  const { ids } = useEditedViewComponent();
  const { templateModel } = useTemplateSettings();

  const indexes = useCurrentViewComponentIndexes(ids, templateModel);
  const viewComponent = useFindViewComponentByIndexes(indexes, templateModel);

  const setViewComponent = useSetViewComponent(indexes, templateModel);

  const contextValue: ContextType = React.useMemo(
    () => ({
      viewComponent: viewComponent as ViewComponent,
      setViewComponent,
    }),
    [setViewComponent, viewComponent]
  );

  if (viewComponent == null) {
    return <Alert title="Wrong ViewComponent" />;
  }

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

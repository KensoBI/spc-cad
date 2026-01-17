import React from 'react';
import { TemplateModel } from 'types/Annotation';

export type ViewComponentIds = {
  viewId: string;
  componentId: string;
};

export type ContextType = {
  ids?: ViewComponentIds;
  setIds: (value: React.SetStateAction<ViewComponentIds | undefined>) => void;
};

const Context = React.createContext<ContextType>({} as ContextType);

export function useEditedViewComponent() {
  return React.useContext(Context);
}

export function EditedViewComponentProvider({ children, ids, setIds }: React.PropsWithChildren<ContextType>) {
  const contextValue: ContextType = React.useMemo(
    () => ({
      ids,
      setIds,
    }),
    [ids, setIds]
  );
  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

export type ViewComponentIndexes = [number, number];

export function useCurrentViewComponentIndexes(ids: ViewComponentIds | undefined, templateModel: TemplateModel) {
  const indexes: ViewComponentIndexes | undefined = React.useMemo(() => {
    if (ids == null || templateModel.template.views == null) {
      return undefined;
    }
    const viewItemIndex = templateModel.template.views?.findIndex((el) => el.id === ids.viewId) ?? -1;
    if (viewItemIndex < 0) {
      return undefined;
    }

    const componentIndex =
      templateModel.template.views[viewItemIndex].components.findIndex((el) => el.id === ids.componentId) ?? -1;
    if (componentIndex < 0) {
      return undefined;
    }
    return [viewItemIndex, componentIndex];
  }, [ids, templateModel.template.views]);

  return indexes;
}

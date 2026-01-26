import { Dictionary } from 'lodash';
import React from 'react';
import { TemplatesMap } from 'types/Annotation';
import { FeatureModel } from 'types/AnnotationModel';

type ContextType = {
  templateModels: TemplatesMap;
  availableColumns: Dictionary<Set<string>>;
  editedWindow?: string;
  editedTemplateId?: number;
  setEditedWindow: (windowUid?: string) => void;
};
const Context = React.createContext<ContextType>({} as ContextType);

export function useTemplateModels() {
  const { templateModels } = React.useContext(Context);
  return templateModels;
}

export function useEditedWindow(): [string | undefined, (windowUid?: string) => void] {
  const { editedWindow, setEditedWindow } = React.useContext(Context);
  return [editedWindow, setEditedWindow];
}

export function useEditedTemplateId(): number | undefined {
  const { editedTemplateId } = React.useContext(Context);
  return editedTemplateId;
}

export function useAvailableColumns() {
  const { availableColumns } = React.useContext(Context);
  return availableColumns;
}

type Props = Pick<ContextType, 'templateModels' | 'availableColumns'> & {
  featureModels: FeatureModel[];
};

export function TemplateModelsProvider({
  children,
  templateModels,
  featureModels,
  availableColumns,
}: React.PropsWithChildren<Props>) {
  const [editedWindow, setEditedWindow] = React.useState<string | undefined>();

  const editedTemplateId = React.useMemo(() => {
    if (editedWindow == null) {
      return undefined;
    }
    return featureModels.find((el) => el.feature.uid === editedWindow)?.computed?.templateId;
  }, [editedWindow, featureModels]);

  const contextValue = React.useMemo(
    () => ({
      templateModels,
      editedWindow,
      setEditedWindow,
      editedTemplateId,
      availableColumns,
    }),
    [templateModels, editedWindow, editedTemplateId, availableColumns]
  );

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}

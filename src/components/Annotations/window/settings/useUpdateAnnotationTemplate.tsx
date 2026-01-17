import { cloneDeep, findIndex } from 'lodash';
import React from 'react';
import { AnnotationTemplate, TemplateModel } from 'types/Annotation';
import { ViewComponent } from 'types/ViewComponentSettings';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { ViewComponentIndexes } from './view-settings/EditedViewComponentProvider';

export function useUpdateAnnotationTemplate() {
  const { options, onOptionsChange } = usePanelProps();

  const update = React.useCallback(
    (template: AnnotationTemplate) => {
      const current = options.boxTemplates ?? [];
      const cloned = cloneDeep(template);
      const index = findIndex(current, (el) => el.id === cloned.id);
      if (index === -1 || options.boxTemplates == null) {
        options.boxTemplates = [...current, cloned];
      } else {
        options.boxTemplates = current.map((el, i) => (i === index ? cloned : el));
      }
      onOptionsChange(options);
    },
    [onOptionsChange, options]
  );

  return update;
}

export function useSetViewComponent(indexes: ViewComponentIndexes | undefined, templateModel: TemplateModel) {
  const update = useUpdateAnnotationTemplate();
  const setViewComponent = React.useCallback(
    (editedComponent: ViewComponent) => {
      if (indexes == null || templateModel.template.views == null) {
        return;
      }
      const [viewIndex, componentIndex] = indexes;
      templateModel.template.views[viewIndex].components[componentIndex] = editedComponent;
      update({ ...templateModel.template });
    },
    [indexes, templateModel.template, update]
  );

  return setViewComponent;
}

export function useFindViewComponentByIndexes(indexes: ViewComponentIndexes | undefined, templateModel: TemplateModel) {
  const viewComponent = React.useMemo(() => {
    if (indexes == null || templateModel.template.views == null) {
      return undefined;
    }
    const [viewIndex, componentIndex] = indexes;
    return templateModel.template.views[viewIndex].components[componentIndex];
  }, [indexes, templateModel.template.views]);

  return viewComponent;
}

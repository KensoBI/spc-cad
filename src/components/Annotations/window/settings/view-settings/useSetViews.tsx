import React from 'react';
import { ViewItem } from 'types/ViewComponentSettings';
import { useTemplateSettings } from '../TemplateSettings';
import { useUpdateAnnotationTemplate } from '../useUpdateAnnotationTemplate';

export function useSetViews() {
  const { templateModel } = useTemplateSettings();
  const update = useUpdateAnnotationTemplate();
  const setViews = React.useCallback(
    (viewsSetter: (prev: ViewItem[]) => ViewItem[]) => {
      const newViews = viewsSetter(templateModel.template.views ?? []);
      templateModel.template.views = [...newViews];
      update({ ...templateModel.template });
    },
    [templateModel.template, update]
  );
  return setViews;
}

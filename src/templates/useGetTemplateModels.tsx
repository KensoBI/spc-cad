import { defaultemplates } from 'constants/defaults';
import React from 'react';
import { AnnotationTemplate, TemplatesMap } from 'types/Annotation';

export function useGetTemplateModels(boxTemplates?: AnnotationTemplate[]) {
  const templates: TemplatesMap = React.useMemo(() => {
    const templatesMap: TemplatesMap = {};

    for (const dt of defaultemplates) {
      templatesMap[dt.id] = {
        template: dt,
        isDefault: true,
      };
    }
    if (boxTemplates) {
      for (const templ of boxTemplates) {
        templatesMap[templ.id] = {
          template: templ,
          isDefault: false,
        };
      }
    }

    return templatesMap;
  }, [boxTemplates]);
  return templates;
}

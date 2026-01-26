import React from 'react';
import { useTemplateSettings } from './TemplateSettings';
import { useUpdateAnnotationTemplate } from './useUpdateAnnotationTemplate';
import { ConditionalStyle } from 'types/Annotation';
import { GenericColorMapping } from '../GenericColorMapping';

export function ColorMappingSettings() {
  const { templateModel } = useTemplateSettings();
  const updateAnnotation = useUpdateAnnotationTemplate();

  const update = React.useCallback(
    (newStyles: ConditionalStyle[]) => {
      updateAnnotation({ ...templateModel.template, headerColors: newStyles });
    },
    [templateModel.template, updateAnnotation]
  );

  return <GenericColorMapping update={update} rows={templateModel.template.headerColors} />;
}

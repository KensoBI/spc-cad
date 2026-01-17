import { AnnotationTemplate, ConditionalStyle } from 'types/Annotation';
import { Feature } from 'types/Feature';
import { resolveCondStyle } from 'utils/condStyleResolver';

export function getFeatureColor(feature: Feature, colorMapping?: ConditionalStyle[], staticLeftValue: any = undefined) {
  if (colorMapping) {
    for (const cs of colorMapping) {
      if (cs && (cs.column || staticLeftValue)) {
        const leftValue = staticLeftValue ?? feature.characteristics?.[cs.control]?.table?.[cs.column];
        const rightValue = !cs.isStatic
          ? feature.characteristics?.[cs.value.dynamic?.control ?? '']?.table?.[cs.value.dynamic?.column ?? '']
          : typeof cs.value.static === 'string'
          ? cs.value.static
          : undefined;

        if (rightValue != null && rightValue !== '' && resolveCondStyle(leftValue, cs.operator, rightValue)) {
          return cs.backgroundColor;
        }
      }
    }
  }
  return undefined;
}

export function getFeatureColorForTemplate(feature: Feature, template: AnnotationTemplate) {
  return getFeatureColor(feature, template.headerColors);
}

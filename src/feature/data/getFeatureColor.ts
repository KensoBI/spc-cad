import { AnnotationTemplate, ConditionalStyle } from 'types/Annotation';
import { Feature } from 'types/Feature';
import { resolveCondStyle } from 'utils/condStyleResolver';
import { CharacteristicAccessor } from 'types/CharacteristicData';

export function getFeatureColor(feature: Feature, colorMapping?: ConditionalStyle[], staticLeftValue: any = undefined) {
  if (colorMapping) {
    for (const cs of colorMapping) {
      if (cs && (cs.column || staticLeftValue)) {
        // NEW: Use accessor
        const charData = feature.characteristics?.[cs.control];
        const accessor = charData ? new CharacteristicAccessor(charData) : undefined;
        const leftValue = staticLeftValue ?? accessor?.get(cs.column);

        const rightCharData = feature.characteristics?.[cs.value.dynamic?.control ?? ''];
        const rightAccessor = rightCharData ? new CharacteristicAccessor(rightCharData) : undefined;
        const rightValue = !cs.isStatic
          ? rightAccessor?.get(cs.value.dynamic?.column ?? '')
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

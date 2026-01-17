import { AnnotationSettings, TemplatesMap } from 'types/Annotation';
import { Feature } from 'types/Feature';
import { FeatureModel } from 'types/AnnotationModel';
import { getFeatureColorForTemplate } from './getFeatureColor';
import { GENERIC_TEMPLATE_ID } from 'constants/defaults';

function* generateFeatureModels(features: Feature[], annotations: AnnotationSettings[], templateModels: TemplatesMap) {
  const anMap = new Map(annotations.map((an) => [an.uid, an]));
  for (const feature of features) {
    const annotation = anMap.get(feature.uid);
    const autoTemplate = annotation?.templateId == null;
    const templateId = !autoTemplate && annotation.templateId ? annotation.templateId : GENERIC_TEMPLATE_ID;
    const template = templateModels?.[templateId]?.template;
    if (!template) {
      continue;
    }
    const model: FeatureModel = {
      feature,
      annotation,
      computed: {
        autoTemplate,
        templateId,
        color: getFeatureColorForTemplate(feature, template),
      },
    };
    yield model;
  }
}

export function getFeatureModels(features: Feature[], annotations: AnnotationSettings[], templateModels: TemplatesMap) {
  if (features.length === 0) {
    return [];
  }
  return [...generateFeatureModels(features, annotations, templateModels)];
}

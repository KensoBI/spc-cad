import { AnnotationSettings } from './Annotation';
import { Feature } from './Feature';

export type FeatureModel = {
  feature: Feature;
  annotation?: AnnotationSettings;
  computed: {
    autoTemplate: boolean;
    templateId: number;
    color?: string;
  };
};

export type FeatureModelAnnotated = FeatureModel & {
  annotation: AnnotationSettings;
};

import { defaults } from 'lodash';
import { AnnotationTemplate, ConditionalStyle } from 'types/Annotation';
import { SceneSettings } from 'types/CadSettings';
import { defaultTimeseriesSettings } from 'types/ViewComponentSettings';

export const GENERIC_TEMPLATE_ID = 1;

export const genericTemplate: AnnotationTemplate = {
  id: GENERIC_TEMPLATE_ID,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Generic',
  templateType: 'generic',
  headerColors: [],
  activeViewId: '1',
  pinned: false,
  views: [
    {
      title: 'Main',
      id: '1',
      components: [{ id: 'main-1', title: 'Main 1', type: 'table', settings: { table: {} } }],
    },
    {
      title: 'X',
      id: '2',
      components: [
        {
          id: 'x-1',
          title: 'x 1',
          type: 'timeseries',
          settings: { timeseries: defaults({ controlName: 'x' }, defaultTimeseriesSettings) },
        },
      ],
    },
    {
      title: 'Y',
      id: '3',
      components: [
        {
          id: 'y-1',
          title: 'y 1',
          type: 'timeseries',
          settings: { timeseries: defaults({ controlName: 'y' }, defaultTimeseriesSettings) },
        },
      ],
    },
    {
      title: 'Z',
      id: '4',
      components: [
        {
          id: 'z-1',
          title: 'z 1',
          type: 'timeseries',
          settings: { timeseries: defaults({ controlName: 'z' }, defaultTimeseriesSettings) },
        },
      ],
    },
  ],
};

export const pointTemplate: AnnotationTemplate = {
  id: 2,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Point',
  templateType: 'point',
  headerColors: [],
  pinned: false,
  views: [],
};

export const circleTemplate: AnnotationTemplate = {
  id: 3,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Circle',
  templateType: 'circle',
  headerColors: [],
  pinned: false,
  views: [],
};

export const cylinderTemplate: AnnotationTemplate = {
  id: 4,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Cylinder',
  templateType: 'cylinder',
  headerColors: [],
  pinned: false,
  views: [],
};

export const sphereTemplate: AnnotationTemplate = {
  id: 5,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Sphere',
  templateType: 'sphere',
  headerColors: [],
  pinned: false,
  views: [],
};

export const ellipseTemplate: AnnotationTemplate = {
  id: 6,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Ellipse',
  templateType: 'ellipse',
  headerColors: [],
  pinned: false,
  views: [],
};

export const lineTemplate: AnnotationTemplate = {
  id: 7,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Line',
  templateType: 'line',
  headerColors: [],
  pinned: false,
  views: [],
};

export const rectangleTemplate: AnnotationTemplate = {
  id: 8,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Rectangle',
  templateType: 'rectangle',
  headerColors: [],
  pinned: false,
  views: [],
};

export const slotTemplate: AnnotationTemplate = {
  id: 9,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Slot',
  templateType: 'slot',
  headerColors: [],
  pinned: false,
  views: [],
};

export const planeTemplate: AnnotationTemplate = {
  id: 10,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Plane',
  templateType: 'plane',
  headerColors: [],
  pinned: false,
  views: [],
};
export const slabTemplate: AnnotationTemplate = {
  id: 11,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Slab',
  templateType: 'slab',
  headerColors: [],
  pinned: false,
  views: [],
};

export const coneTemplate: AnnotationTemplate = {
  id: 12,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Cone',
  templateType: 'cone',
  headerColors: [],
  pinned: false,
  views: [],
};

export const comparisonPointTemplate: AnnotationTemplate = {
  id: 13,
  titleColumn: 'feature',
  link: {
    url: '',
    openInNewTab: true,
  },
  useTemplates: true,
  templateName: 'Comparison point',
  templateType: 'comparison point',
  headerColors: [],
  pinned: false,
  views: [],
};

export const defaultConditionalStyle: ConditionalStyle = {
  backgroundColor: '#1F60C4',
  column: '',
  control: '',
  isStatic: true,
  operator: '>',
  textColor: 'white',
  value: {
    static: '',
  },
};

export const defaultemplates: AnnotationTemplate[] = [
  genericTemplate,
  pointTemplate,
  circleTemplate,
  cylinderTemplate,
  sphereTemplate,
  ellipseTemplate,
  lineTemplate,
  rectangleTemplate,
  slotTemplate,
  planeTemplate,
  slabTemplate,
  coneTemplate,
  comparisonPointTemplate,
];

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  cameraX: 0,
  cameraY: 0,
  cameraZ: 2500,
  targetX: 0,
  targetY: 0,
  targetZ: 0,
  upX: 0,
  upY: 1,
  upZ: 0,
};

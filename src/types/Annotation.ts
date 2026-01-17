import { DataFrame } from '@grafana/data';
import { ViewItem } from './ViewComponentSettings';

export type AnnotationTemplate = {
  id: number;
  templateName: string;
  templateType: string;
  titleColumn: string;
  pinned: boolean;
  useTemplates?: boolean;
  link?: LinkSettings;
  headerColors?: ConditionalStyle[];
  activeViewId?: string;
  gridPos?: GridPos;
  views?: ViewItem[];
  overrides?: any;
};

export type TemplateModel = {
  template: AnnotationTemplate;
  isDefault: boolean;
};

export type TemplatesMap = {
  [key: number]: TemplateModel;
};

export type AnnotationSettings = {
  uid: string;
  display: 'hide' | 'window' | 'label';
  titleColumn?: string;
  link?: LinkSettings;
  isEditing?: boolean;
  templateId?: number;
  headerColors?: ConditionalStyle[];
  activeViewId?: string;
  gridPos?: GridPos;
  overrides?: any;
};

export type GridPos = {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  //static?: boolean;
};

export type DynamicReferenceValue = {
  control: string;
  column: string;
};

export type ConditionalStyle = {
  operator: string;
  isStatic: boolean;
  control: string;
  column: string;
  value: {
    static?: string;
    dynamic?: DynamicReferenceValue;
  };
  textColor: string;
  backgroundColor: string;
};
export type LinkSettings = {
  url: string;
  openInNewTab: boolean;
};

export type BoxView = {
  id: number;
  name: string;
  control: string;
  type: string;
  tableHeaders?: string[];
  showTableHeaders?: boolean;
  showInMenu: boolean;
  table?: any[][];
  groups: number[];
  chartOptions?: any;
  chartData?: DataFrame[];
  text: string;
  imageUrl: string;
  imageHeight?: number;
  imageWidth?: number;
};

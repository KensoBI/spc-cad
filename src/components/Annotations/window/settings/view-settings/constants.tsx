import { keyBy } from 'lodash';
import { ViewComponentConfig, ViewComponentKey } from 'types/ViewComponentSettings';

export const VIEWS_DROPPABLE_ID = 'views';
export const VIEWS_DROPPABLE_TYPE = 'ROW';
export const COMPONENTS_DROPPABLE_TYPE = 'QUOTES';

export const viewComponents: ViewComponentConfig[] = [
  { title: 'Table', icon: 'table', key: 'table' },
  { title: 'Time series', icon: 'chart-line', key: 'timeseries' },
  { title: 'Grid', icon: 'gf-grid', key: 'grid' },
];

export const viewComponentsMap = keyBy(viewComponents, (el) => el.key) as {
  [key in ViewComponentKey]: ViewComponentConfig;
};

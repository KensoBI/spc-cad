import { IconName } from '@grafana/data';
import { ConditionalStyle, LinkSettings } from './Annotation';

type TableComponentKey = 'table';
type TimeseriesComponentKey = 'timeseries';
type GridComponentKey = 'grid';
export type ViewComponentKey = TableComponentKey | TimeseriesComponentKey | GridComponentKey;

export type TableSettings = {
  columns?: string[];
  rows?: string[]; //Array<characteristic_id>
  decimals?: number;
};

export const defaultTableSettings: TableSettings = {
  columns: undefined,
  rows: undefined,
  decimals: 2,
};

export type LimitConfigItem = {
  name: string;
  color: string;
};

export type LimitConfig = {
  up?: LimitConfigItem;
  down?: LimitConfigItem;
};

export type TimeseriesSettings = {
  characteristicId: string;
  limitConfig?: LimitConfig;
  constantsConfig?: Array<{
    name: string;
    color: string;
    title: string;
  }>;
  fill: number;
  lineWidth: number;
  pointSize: number;
  lineColor?: string;
  showLegend?: boolean;
  decimals?: number;
};

export const defaultTimeseriesSettingsColor = 'rgb(31, 96, 196)';
export const defaultTimeseriesSettings = {
  characteristicId: '',
  fill: 0,
  lineWidth: 2,
  pointSize: 6,
  lineColor: defaultTimeseriesSettingsColor,
  showLegend: false,
  decimals: 2,
};

export type GridCell = {
  id: string;
  name: string;
  staticText: boolean;
  value: {
    dynamic?: {
      characteristic_id: string;
      column: string;
    };
    static?: string;
  };
  colorMapping: ConditionalStyle[];
  link?: LinkSettings;
  suffix?: string;
  formatters?: {
    number?: {
      decimals?: number;
    };
  };
};

export type GridSettings = {
  showHeaders: boolean;
  cells?: GridCell[];
};

export const defaultGridSettings: GridSettings = {
  showHeaders: false,
};

export type ViewComponent = {
  id: string;
  title: string;
  type: ViewComponentKey;
  settings: Partial<
    Record<TableComponentKey, TableSettings> &
      Record<TimeseriesComponentKey, TimeseriesSettings> &
      Record<GridComponentKey, GridSettings>
  >;
};

export type ViewComponentSettingsTypes = TableSettings | TimeseriesSettings | GridSettings;

export type ViewItem = {
  id: string;
  title: string;
  components: ViewComponent[];
};

export type ViewComponentConfig = {
  title: string;
  icon: IconName;
  key: ViewComponentKey;
};

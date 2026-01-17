import { PanelPlugin } from '@grafana/data';
import { FeaturesEditor } from 'components/Editor/FeaturesEditor';
import { ModelsEditor } from 'components/Editor/ModelsEditor';
import { CadPanelOptions, defaults } from 'types/CadPanelOptions';
import { CadPanel } from './CadPanel';
import { withCheckToken } from 'utils/checkToken';

export const plugin = new PanelPlugin<CadPanelOptions>(withCheckToken(CadPanel)).setPanelOptions((builder) => {
  builder.addCustomEditor({
    id: 'cadSettings',
    path: 'cadSettings',
    name: 'CAD options',
    description: 'CAD List',
    defaultValue: [],
    editor: ModelsEditor,
    category: ['CAD'],
  });

  builder.addCustomEditor({
    id: 'featureSettings',
    path: 'featureSettings',
    name: 'Feature',
    description: 'Display settings',
    defaultValue: defaults.featureSettings,
    editor: FeaturesEditor,
    category: ['CAD'],
  });

  return builder;
});

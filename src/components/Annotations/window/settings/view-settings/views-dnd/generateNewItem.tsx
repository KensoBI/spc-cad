import { toNumber } from 'lodash';
import {
  defaultGridSettings,
  defaultTableSettings,
  defaultTimeseriesSettings,
  ViewComponent,
  ViewComponentKey,
  ViewComponentSettingsTypes,
} from 'types/ViewComponentSettings';

function getSuffixNumber(baseName: string, defaultValue = 1): [string, number] {
  const parts = baseName.split(' ');
  const lastPart = parts?.[parts.length - 1];
  const value = toNumber(lastPart);
  if (value != null && !isNaN(value)) {
    return [parts.slice(0, -1).join(' '), value];
  }
  return [baseName, defaultValue];
}

export function generateNewItem(items: ViewComponent[], suggestedName: string, type: ViewComponentKey) {
  const allNames = new Set(items.map((item) => item.title.toLowerCase()));
  let [baseName, i] = getSuffixNumber(suggestedName, 1);
  let newName = baseName;
  while (allNames.has(newName.toLowerCase()) && i < 1000) {
    newName = baseName + (i === 1 ? '' : ` ${i}`);
    i++;
  }

  const settings: ViewComponentSettingsTypes =
    type === 'table' ? defaultTableSettings : type === 'timeseries' ? defaultTimeseriesSettings : defaultGridSettings;

  const item: ViewComponent = {
    id: (Math.random() + 1).toString(36).substring(7),
    title: newName,
    type,
    settings: {
      [type]: settings,
    },
  };

  return item;
}

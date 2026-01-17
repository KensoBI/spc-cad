import { CadPanelProps } from 'types/CadPanelProps';

export function isPanelEditing(props: CadPanelProps) {
  return props.data.request?.app === 'panel-editor';
}

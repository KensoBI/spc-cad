import { SpcCadProps } from 'types/SpcCadProps';

export function isPanelEditing(props: SpcCadProps) {
  return props.data.request?.app === 'panel-editor';
}

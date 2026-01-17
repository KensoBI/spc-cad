import { useTheme2 } from '@grafana/ui';

export function useDefaultColor() {
  const theme = useTheme2();
  return theme.isDark ? 'black' : '#dde4ed';
}

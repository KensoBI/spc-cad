import React from 'react';
import { CadPanelProps } from 'types/CadPanelProps';

const Context = React.createContext({} as CadPanelProps);

export function usePanelProps() {
  return React.useContext(Context);
}

export function PanelPropsProvider({ children, panelProps }: React.PropsWithChildren<{ panelProps: CadPanelProps }>) {
  return <Context.Provider value={panelProps}>{children}</Context.Provider>;
}

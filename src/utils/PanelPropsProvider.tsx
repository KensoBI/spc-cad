import React from 'react';
import { SpcCadProps } from 'types/SpcCadProps';

const Context = React.createContext({} as SpcCadProps);

export function usePanelProps() {
  return React.useContext(Context);
}

export function PanelPropsProvider({ children, panelProps }: React.PropsWithChildren<{ panelProps: SpcCadProps }>) {
  return <Context.Provider value={panelProps}>{children}</Context.Provider>;
}

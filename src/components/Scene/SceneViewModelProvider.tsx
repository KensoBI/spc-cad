import React from 'react';
import SceneViewModel from './SceneViewModel';

const Context = React.createContext<SceneViewModel>({} as SceneViewModel);

export function useSceneViewModel() {
    return React.useContext(Context);
}

export function SceneViewModelProvider({
  children,
  sceneViewModel,
}: React.PropsWithChildren<{ sceneViewModel: SceneViewModel }>) {
  return <Context.Provider value={sceneViewModel}>{children}</Context.Provider>;
}

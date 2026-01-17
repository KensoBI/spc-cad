import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
const Context = React.createContext<FeatureModelAnnotated>({} as FeatureModelAnnotated);

export function FeatureModelProvider({
  children,
  featureModel,
}: React.PropsWithChildren<{ featureModel: FeatureModelAnnotated }>) {
  return <Context.Provider value={featureModel}>{children}</Context.Provider>;
}

export function useFeatureModel() {
  return React.useContext(Context);
}

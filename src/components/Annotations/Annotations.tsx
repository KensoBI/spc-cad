import React from 'react';
import { AnnotationSettings, GridPos } from 'types/Annotation';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { Label } from './label/Label';
import { AnnotationsContainer } from './container';
import RGL from 'react-grid-layout';
import { isEqual, keyBy } from 'lodash';
import { Window } from './window/Window';
import { FeatureModel, FeatureModelAnnotated } from 'types/AnnotationModel';
import { FocusProvider } from './window/FocusProvider';

function isPinnedWindow(an: AnnotationSettings) {
  return an.display === 'window' && an.gridPos != null;
}

function anToLayout(fma: FeatureModelAnnotated) {
  return {
    i: fma.annotation.uid,
    ...(fma.annotation.gridPos as NonNullable<GridPos>),
  };
}

type GroupedBoxes = { windows: FeatureModelAnnotated[]; labels: FeatureModelAnnotated[] };

function useGroupBoxes(featureModels: FeatureModel[]) {
  return React.useMemo(() => {
    const grouped: GroupedBoxes = {
      windows: [],
      labels: [],
    };
    for (const fm of featureModels) {
      if (fm.annotation && (fm.annotation.display === 'label' || fm.annotation.display === 'window')) {
        if (isPinnedWindow(fm.annotation)) {
          grouped.windows.push(fm as FeatureModelAnnotated);
        } else {
          grouped.labels.push(fm as FeatureModelAnnotated);
        }
      }
    }
    return grouped;
  }, [featureModels]);
}

function isEqualLayout(value?: GridPos, other?: GridPos) {
  if (other == null) {
    return false;
  }
  if (value == null) {
    return true;
  }
  return value.x === other.x && value.y === other.y && value.w === other.w && value.h === other.h;
}

type AnnotationsProps = {
  featureModels: FeatureModel[];
};

export function Annotations({ featureModels }: AnnotationsProps) {
  const { options, onOptionsChange } = usePanelProps();

  const { windows, labels } = useGroupBoxes(featureModels);
  const windowsLayout = React.useMemo(() => {
    return windows.map(anToLayout);
  }, [windows]);

  const onLayoutChange = React.useCallback(
    (layout: RGL.Layout[]) => {
      if (options.annotations == null) {
        return;
      }
      const mappedLayout = keyBy(layout, (l) => l.i);
      const newAnnotations = options.annotations.map((an) => {
        if (an.display === 'window' && !isEqualLayout(an.gridPos, mappedLayout?.[an.uid])) {
          an.gridPos = mappedLayout?.[an.uid];
        }
        return an;
      });
      if (!isEqual(newAnnotations, options.annotations)) {
        onOptionsChange({
          ...options,
          annotations: newAnnotations,
        });
      }
    },
    [onOptionsChange, options]
  );

  return (
    <FocusProvider>
      <AnnotationsContainer
        layout={windowsLayout}
        onLayoutChange={onLayoutChange}
        labels={labels.map((fma) => (
          <Label
            key={fma.feature.uid}
            uid={fma.feature.uid}
            color={fma.computed.color}
            icon={undefined}
            isEditing={fma.annotation.isEditing}
            title={fma.annotation.titleColumn}
          />
        ))}
        windows={windows.map((fma) => (
          <Window key={fma.feature.uid} featureModel={fma} />
        ))}
      />
    </FocusProvider>
  );
}

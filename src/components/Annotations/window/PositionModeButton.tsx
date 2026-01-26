import { IconName } from '@grafana/data';
import { ConfirmModal, ModalsContext, Tooltip, Icon } from '@grafana/ui';
import React from 'react';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { isPanelEditing } from 'utils/isPanelEditing';
import { useFeatureModel } from './FeatureModelProvider';
import { useSameCoordsClick } from 'utils/sameCoordsClick';
import { omit } from 'lodash';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { PositionMode } from 'types/PositionMode';

const positionModeOptions: { [key in PositionMode]: { icon: IconName; label: string } } = {
  hasXyzCharacteristics: {
    icon: 'anchor',
    label: 'The feature has XYZ characteristics',
  },
  customPosition: {
    icon: 'plus-circle',
    label: 'The feature has a user-defined position. Click to reset.',
  },
  noPosition: {
    icon: 'times',
    label: 'Feature with no position. Click to hide.',
  },
  undefined: {
    icon: 'question-circle',
    label: 'Undefined',
  },
};

export function PositionModeButton() {
  const panelProps = usePanelProps();
  const isEditing = isPanelEditing(panelProps);

  if (!isEditing) {
    return null;
  }

  return <Content />;
}

function Content() {
  const featureModel = useFeatureModel();
  const mode = featureModel.feature.positionMode;
  if (mode === 'hasXyzCharacteristics' || mode === 'undefined') {
    return null;
  }

  return <TolltipButton mode={mode} featureModel={featureModel} />;
}

type TooltipButtonProps = {
  mode: PositionMode;
  featureModel: FeatureModelAnnotated;
};

function TolltipButton({ mode, featureModel }: TooltipButtonProps) {
  const selected = React.useMemo(() => {
    return positionModeOptions[mode];
  }, [mode]);

  const { showModal, hideModal } = React.useContext(ModalsContext);
  const panelProps = usePanelProps();
  const { onOptionsChange, options } = panelProps;

  const mouseEvents = useSameCoordsClick<SVGElement>(
    React.useCallback(() => {
      const resetOverrides = () => {
        onOptionsChange({
          ...options,
          featureOverrides: options.featureOverrides?.[featureModel.feature.id]
            ? omit(options.featureOverrides, [featureModel.feature.id])
            : options.featureOverrides,
        });
      };
      if (mode === 'customPosition') {
        showModal(ConfirmModal, {
          title: 'Reset position',
          body: 'Are you sure you want to reset the position of this window?',
          confirmText: 'Reset',
          isOpen: true,
          onConfirm: () => {
            resetOverrides();
            hideModal();
          },
          onDismiss: () => {
            hideModal();
          },
        });
      } else if (mode === 'noPosition') {
        resetOverrides();
      }
    }, [featureModel.feature.id, hideModal, mode, onOptionsChange, options, showModal])
  );

  return (
    <Tooltip content={selected.label} placement="bottom">
      <Icon {...mouseEvents} name={selected.icon} className="onHover" style={{ transform: 'translateY(-1.5px)' }} />
    </Tooltip>
  );
}

import React from 'react';
import { InlineField, Slider } from '@grafana/ui';
import { FeatureSettings } from 'types/CadSettings';
import { InlineColorField } from 'components/InlineColorField';
import { StandardEditorProps } from '@grafana/data';
import { SpcCadOptions } from 'types/SpcCadOptions';
import SceneViewModel from 'components/Scene/SceneViewModel';
import { UnpositionedFeatures } from 'components/UnpositionedFeatures';
import { TransferableFeature } from 'types/Feature';

type Props = StandardEditorProps<FeatureSettings, any, SpcCadOptions>;

export function FeaturesEditor({ value, onChange, context }: Props) {
  const sceneViewModel = context.instanceState?.scene as SceneViewModel | undefined;
  const onOptionsChange = context.instanceState?.onOptionsChange as (opts: SpcCadOptions) => void | undefined;
  const unpositionedFeatures = context.instanceState?.unpositionedFeatures as TransferableFeature[] | undefined;
  return (
    <div>
      <InlineField label="Size" grow>
        <Slider inputId="feature-size-slider" max={200} min={1} value={value.size} onChange={(newValue) => onChange({ ...value, size: newValue })} />
      </InlineField>
      <InlineColorField
        color={value.color}
        onChange={(newColor) =>
          onChange({
            ...value,
            color: newColor,
          })
        }
      />
      {sceneViewModel != null &&
        onOptionsChange != null &&
        context.options != null &&
        unpositionedFeatures != null &&
        unpositionedFeatures.length > 0 && (
          <UnpositionedFeatures
            features={unpositionedFeatures}
            onOptionsChange={onOptionsChange}
            options={context.options}
            sceneViewModel={sceneViewModel}
          />
        )}
    </div>
  );
}

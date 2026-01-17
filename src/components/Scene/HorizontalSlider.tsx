import React from 'react';
import { Slider } from '@grafana/ui';

type HorizontalSliderProps = {
  steps: number;
  currentValue: number;
  onAfterChange: (value: number) => void;
  marks: Array<{ value: number; label: string }>;
};

export function HorizontalSlider({ steps, currentValue, onAfterChange, marks }: HorizontalSliderProps) {
  return (
    <Slider
      inputId="horizontal-slider"
      min={0}
      max={steps}
      step={1}
      value={currentValue}
      reverse
      marks={marks}
      onAfterChange={(value) => {
        if (value != null) {
          onAfterChange(value);
        }
      }}
      tooltipAlwaysVisible
    />
  );
}

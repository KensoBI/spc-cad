import React from 'react';
import { Button, ColorPicker, InlineField, Input, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { CadSettings } from 'types/CadSettings';
import { DEFAULT_CAD_COLOR } from 'constants/global';

export function ModelsEditor({ value, onChange }: { value: CadSettings[]; onChange: (v: CadSettings[]) => void }) {
  const styles = useStyles2(getStyles);

  const onAdd = () => {
    onChange([...value, { path: '', color: DEFAULT_CAD_COLOR, id: Date.now() }]);
  };

  return (
    <div>
      <div>
        {value.map((model, index) => (
          <div key={index} className={styles.model}>
            <InlineField label="Path" grow>
              <Input
                placeholder="Path"
                onChange={(e) => {
                  model.path = e.currentTarget.value;
                  onChange([...value]);
                }}
                value={model.path}
                suffix={
                  <ColorPicker
                    color={model.color}
                    onChange={(newColor) => {
                      model.color = newColor;
                      onChange([...value]);
                    }}
                  />
                }
              />
            </InlineField>
            <Button
              size="md"
              variant="destructive"
              fill="text"
              icon={'times'}
              onClick={() => {
                onChange(value.filter((_, i) => i !== index));
              }}
            />
          </div>
        ))}
      </div>
      <Button icon="plus" onClick={onAdd}>
        Add
      </Button>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  model: css`
    display: flex;
  `,
  colorPicker: css`
    margin-right: ${theme.spacing(2)};
    margin-left: ${theme.spacing(1)};
  `,
});

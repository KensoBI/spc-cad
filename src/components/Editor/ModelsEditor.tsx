import React from 'react';
import { Button, ColorPicker, InlineField, Input, useStyles2, Badge, Tooltip } from '@grafana/ui';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { CadSettings } from 'types/CadSettings';
import { DEFAULT_CAD_COLOR } from 'constants/global';

export function ModelsEditor({ value, onChange }: { value: CadSettings[]; onChange: (v: CadSettings[]) => void }) {
  const styles = useStyles2(getStyles);

  const onAddUrl = () => {
    onChange([...value, { path: '', color: DEFAULT_CAD_COLOR, id: Date.now(), source: 'url' }]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64DataUrl = e.target?.result as string;
      onChange([
        ...value,
        {
          id: Date.now(),
          path: base64DataUrl,
          color: DEFAULT_CAD_COLOR,
          source: 'base64',
          fileName: file.name,
        },
      ]);
    };

    reader.onerror = () => {
      alert('Failed to read file');
    };

    reader.readAsDataURL(file);
  };

  const onUploadFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stl,.3mf,.ply,.asc,.jpg,.jpeg,.png,.svg';
    input.onchange = handleFileUpload as unknown as (e: Event) => void;
    input.click();
  };

  return (
    <div>
      <div>
        {value.map((model, index) => (
          <div key={index} className={styles.model}>
            <InlineField label="Path" grow>
              <Input
                placeholder={model.source === 'base64' ? 'Uploaded file' : 'Enter URL'}
                onChange={(e) => {
                  model.path = e.currentTarget.value;
                  model.source = 'url';
                  onChange([...value]);
                }}
                value={model.source === 'base64' ? model.fileName || 'Uploaded file' : model.path}
                disabled={model.source === 'base64'}
                prefix={
                  model.source === 'base64' ? (
                    <Tooltip content="Uploaded file">
                      <Badge color="blue" icon="upload" text="" />
                    </Tooltip>
                  ) : (
                    <Tooltip content="URL">
                      <Badge color="blue" icon="link" text="" />
                    </Tooltip>
                  )
                }
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
              aria-label="Remove model"
              onClick={() => {
                onChange(value.filter((_, i) => i !== index));
              }}
            />
          </div>
        ))}
      </div>
      <div className={styles.buttons}>
        <Tooltip content="Add model from URL">
          <Button icon="plus" onClick={onAddUrl} variant="secondary">
            Add URL
          </Button>
        </Tooltip>
        <Tooltip content="Upload file (max 5MB)">
          <Button icon="upload" onClick={onUploadFile} variant="secondary">
            Upload
          </Button>
        </Tooltip>
      </div>
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
  buttons: css`
    display: flex;
    gap: ${theme.spacing(1)};
    margin-top: ${theme.spacing(1)};
  `,
});

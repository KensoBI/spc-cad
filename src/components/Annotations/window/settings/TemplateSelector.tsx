import { Button, InlineField, InlineSwitch, Input, Select, Tooltip } from '@grafana/ui';
import { cloneDeep } from 'lodash';
import React from 'react';
import { useTemplateModels } from 'templates/TemplateModelsProvider';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { useFeatureModel } from '../FeatureModelProvider';
import { useTemplateSettings } from './TemplateSettings';
import { useUpdateAnnotationTemplate } from './useUpdateAnnotationTemplate';

export function TemplateSelector() {
  const { templateModel } = useTemplateSettings();
  const featureModel = useFeatureModel();
  const allTemplateModels = useTemplateModels();
  const [renameMode, setRenameMode] = React.useState<boolean>(false);

  const templateSelectOptions = React.useMemo(() => {
    return Object.values(allTemplateModels).map((t) => ({
      value: t.template.id,
      label: t.template.templateName,
    }));
  }, [allTemplateModels]);

  const { options, onOptionsChange } = usePanelProps();

  const onSelectTemplate = (templateId?: number) => {
    const an = options.annotations?.find((an) => an.uid === featureModel.annotation.uid);
    if (!an || options.annotations == null) {
      return;
    }
    an.templateId = templateId;
    options.annotations = [...options.annotations];
    onOptionsChange(options);
  };

  const update = useUpdateAnnotationTemplate();
  const onAdd = () => {
    const newTemplate = cloneDeep(templateModel.template);
    const allIds = templateSelectOptions.map((o) => o.value);
    newTemplate.id = Math.min(100, Math.max(...allIds)) + 1;
    const allNames = new Set(templateSelectOptions.map((o) => o.label.toLowerCase()));
    const baseName = featureModel.annotation.titleColumn ?? 'template';
    let i = 0;
    do {
      newTemplate.templateType = newTemplate.templateName = baseName + (i === 0 ? '' : ` v.${i}`);
      i++;
    } while (allNames.has(newTemplate.templateName.toLowerCase()) && i < 1000);
    update(newTemplate);
    onSelectTemplate(newTemplate.id);
  };

  const renameInputRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (renameMode) {
      timeout = setTimeout(() => {
        if (renameInputRef.current != null) {
          renameInputRef.current.focus();
        }
      }, 100);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [renameMode]);

  React.useEffect(() => {
    setRenameMode(false);
  }, [templateModel.template.id]);

  return (
    <>
      <InlineField label="Template" tooltip={`Current template`}>
        <>
          {!renameMode ? (
            <div style={{ display: 'flex' }}>
              <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                <Tooltip content={'Rename selected template'}>
                  <Button
                    icon="edit"
                    variant="secondary"
                    fill="text"
                    size="sm"
                    aria-label="Rename template"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setRenameMode(true);
                    }}
                  />
                </Tooltip>
              </div>
              <Select
                width={20}
                value={templateModel.template.id}
                options={templateSelectOptions}
                onChange={(v) => onSelectTemplate(v.value)}
                prefix={<span style={{ fontSize: 9 }}>{featureModel.computed.autoTemplate ? 'auto' : 'manual'}</span>}
              />
            </div>
          ) : (
            <Input
              width={20}
              value={templateModel.template.templateName}
              onChange={(e) => {
                update({
                  ...templateModel.template,
                  templateName: e.currentTarget.value,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setRenameMode(false);
                }
              }}
              prefix={
                <Button icon="check" variant="success" fill="text" size="sm" aria-label="Confirm rename" onClick={() => setRenameMode(false)} />
              }
            />
          )}
        </>
      </InlineField>
      <InlineField label="Auto" tooltip={'Auto assign template'}>
        <InlineSwitch
          value={featureModel.computed.autoTemplate}
          onChange={(e) => onSelectTemplate(featureModel.computed.autoTemplate ? templateModel.template.id : undefined)}
        />
      </InlineField>
      <Button variant="success" fill="text" icon="plus-circle" onClick={onAdd}>
        New
      </Button>
    </>
  );
}

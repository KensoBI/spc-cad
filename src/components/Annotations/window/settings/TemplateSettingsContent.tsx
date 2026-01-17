import { Button, IconButton, useStyles2 } from '@grafana/ui';
import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { ColorMappingSettings } from './ColorMappingSettings';
import { css } from 'emotion';
import { useTemplateSettings } from './TemplateSettings';
import { FeatureTemplateSettings } from './FeatureTemplateSettings';
import { ViewSettings } from './view-settings/ViewSettings';
import { useEditedViewComponent } from './view-settings/EditedViewComponentProvider';

export type TabsOptions = 'feature' | 'colors' | 'views';

type ViewHeadersType = {
  [key in TabsOptions]: string;
};

const viewHeaders: ViewHeadersType = {
  feature: 'Feature',
  colors: 'Color mapping',
  views: 'Views',
};

type Props = {
  tab: TabsOptions;
  setTab: React.Dispatch<React.SetStateAction<TabsOptions>>;
};

export function TemplateSettingsContent({ tab, setTab }: Props) {
  const styles = useStyles2(getStyles);
  const { templateModel } = useTemplateSettings();

  const { ids: editedViewComponentIds, setIds: setEditedViewComponentIds } = useEditedViewComponent();

  const onPrevClick = () => {
    if (tab === 'views' && editedViewComponentIds != null) {
      setEditedViewComponentIds(undefined);
      return;
    }

    setTab('feature');
  };

  return (
    <div className={styles.container}>
      {tab === 'feature' ? (
        <>
          <FeatureTemplateSettings templateName={templateModel.template.templateName} />
          <div className={styles.tabsContainer}>
            <Button
              size="sm"
              fill="outline"
              variant="primary"
              icon="palette"
              onClick={() => {
                setTab('colors');
              }}
            >
              {viewHeaders['colors']}
            </Button>
            <Button
              size="sm"
              fill="outline"
              variant="primary"
              icon="list-ul"
              onClick={() => {
                setTab('views');
              }}
            >
              {viewHeaders['views']}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.header}>
            <IconButton name="angle-left" onClick={onPrevClick} />
            <div className="templateViewName">{viewHeaders[tab]}</div>
            <div>Template: {templateModel.template.templateName}</div>
          </div>
          <div>{tab === 'colors' ? <ColorMappingSettings /> : tab === 'views' ? <ViewSettings /> : <></>}</div>
        </>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      min-width: 300px;
    `,
    header: css`
      display: flex;
      padding: ${theme.spacing(1)};
      gap: ${theme.spacing(1)};
      font-size: 11px;

      & .templateViewName {
        flex-grow: 1;
      }
    `,
    tabsContainer: css`
      padding: ${theme.spacing(1)};
      margin-top: ${theme.spacing(1)};
      display: flex;
      justify-content: center;
      border-top: 1px solid ${theme.colors.primary.border};
      gap: ${theme.spacing(1)};
    `,
  };
};

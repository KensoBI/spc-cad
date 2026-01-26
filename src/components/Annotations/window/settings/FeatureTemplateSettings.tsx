import { useStyles2 } from '@grafana/ui';
import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from 'emotion';
import { TemplateSelector } from './TemplateSelector';
import { useFeatureModel } from '../FeatureModelProvider';
import { usePanelProps } from 'utils/PanelPropsProvider';
import { LinkSettings } from 'types/Annotation';
import { LinkSettingsComponent } from '../LinkSettingsComponent';

export function FeatureTemplateSettings({ templateName }: { templateName: string }) {
  const styles = useStyles2(getStyles);
  const featureModel = useFeatureModel();
  const { options, onOptionsChange } = usePanelProps();

  const setLink = React.useCallback(
    (link: LinkSettings | undefined) => {
      const an = options.annotations?.find((an) => an.uid === featureModel.feature.uid);
      if (!an || options.annotations == null) {
        return;
      }
      an.link = link;
      options.annotations = [...options.annotations];
      onOptionsChange(options);
    },
    [options, onOptionsChange, featureModel.feature.uid]
  );

  return (
    <>
      <div className={styles.header}>
        <div>Feature: {featureModel.annotation.titleColumn ?? 'unknown'}</div>
      </div>
      <div>
        <LinkSettingsComponent link={featureModel.annotation.link} setLink={setLink} />
      </div>
      <div>
        <div style={{ display: 'flex' }}>
          <TemplateSelector />
        </div>
      </div>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
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
      //margin-top: ${theme.spacing(1)};
      display: flex;
      justify-content: center;
      //   border-top: 1px solid ${theme.colors.primary.border};
    `,
  };
};

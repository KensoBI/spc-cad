import { GrafanaTheme2 } from '@grafana/data';
import { Alert, getTextColorForBackground, useStyles2 } from '@grafana/ui';
import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { useWindowSize } from '../container/Windows';
import { css, cx } from 'emotion';
import { TitleBar } from './TitleBar';
import { TableComponent } from './components/TableComponent/TableComponent';
import { TimeSeriesComponent } from './components/TimeSeriesComponent/TimeSeriesComponent';
import { useOnCloseAnnotation } from '../useOnCloseAnnotation';
import { useOnUnPin } from '../useOnPin';
import { FeatureModelProvider } from './FeatureModelProvider';
import { useWindowViewValue } from './useWindowView';
import { TemplateSettingsProvider } from './settings/TemplateSettings';
import { useEditedTemplateId, useTemplateModels } from 'templates/TemplateModelsProvider';
import { useFocusedViewGetters } from './FocusProvider';
import { useDefaultColor } from '../useDefaultColor';
import { ComponentsWrapper } from './ComponentsWrapper';
import { GridComponent } from './components/GridComponent/GridComponent';
import { TITLE_BAR_HEIGHT, WINDOW_BORDER } from 'constants/global';

export type WindowProps = {
  featureModel: FeatureModelAnnotated;
};

const isComponent = (c: JSX.Element | null): c is JSX.Element => {
  return c != null;
};

export function Window({ featureModel }: WindowProps) {
  const { height } = useWindowSize();
  const styles = useStyles2(getStyles);
  const onCloseAnnotation = useOnCloseAnnotation(featureModel.feature.uid);
  const onUnPin = useOnUnPin(featureModel.feature.uid);
  const windowViewId = useWindowViewValue(featureModel.annotation);

  const defaultColor = useDefaultColor();
  const borderColor = featureModel.computed.color ?? defaultColor;
  const titleColor = getTextColorForBackground(borderColor);

  const editedTemplateId = useEditedTemplateId();

  const templateModels = useTemplateModels();
  const templateModel = templateModels?.[featureModel.computed.templateId];

  const views = React.useMemo(() => templateModel?.template.views ?? [], [templateModel?.template.views]);

  const { focusedViewItemId } = useFocusedViewGetters();
  const focusedView = React.useMemo(() => views.find((v) => v.id === focusedViewItemId), [focusedViewItemId, views]);

  const selectedView = React.useMemo(() => {
    if (focusedView != null) {
      return focusedView;
    }
    if (templateModel == null) {
      return undefined;
    }
    if (windowViewId == null && views.length > 0) {
      return views[0];
    }
    return views.find((v) => v.id === windowViewId);
  }, [focusedView, templateModel, views, windowViewId]);

  const components = React.useMemo(() => {
    if (
      !templateModel ||
      selectedView?.components == null ||
      selectedView?.id == null ||
      !Array.isArray(selectedView?.components)
    ) {
      return [];
    }

    return selectedView.components
      .map((viewComponent) => {
        if (viewComponent.type === 'table' && viewComponent.settings.table) {
          return (
            <TableComponent
              key={viewComponent.id}
              featureModel={featureModel}
              settings={viewComponent.settings.table}
            />
          );
        }
        if (viewComponent.type === 'timeseries' && viewComponent.settings.timeseries) {
          return (
            <TimeSeriesComponent
              key={viewComponent.id}
              viewComponentIds={{ viewId: selectedView.id, componentId: viewComponent.id }}
              featureModel={featureModel}
              settings={viewComponent.settings.timeseries}
              templateModel={templateModel}
            />
          );
        }
        if (viewComponent.type === 'grid' && viewComponent.settings.grid) {
          return (
            <GridComponent key={viewComponent.id} featureModel={featureModel} settings={viewComponent.settings.grid} />
          );
        }
        return null;
      })
      .filter(isComponent);
  }, [featureModel, selectedView?.components, selectedView?.id, templateModel]);

  if (!templateModel) {
    console.warn(`templateModels?.[${featureModel.computed.templateId}] doesn't exist`);
    return <></>;
  }
  return (
    <FeatureModelProvider featureModel={featureModel}>
      <TemplateSettingsProvider templateModel={templateModel} featureUid={featureModel.feature.uid}>
        <div
          className={cx({
            [styles.windowContainer]: true,
            [styles.currentEdited]: templateModel.template.id === editedTemplateId,
          })}
          style={{ borderColor }}
        >
          <TitleBar
            headerColor={borderColor}
            titleColor={titleColor}
            onCloseClick={onCloseAnnotation}
            onUnPin={onUnPin}
          />
          <div className={styles.viewsContainer} style={{ height: `${height - TITLE_BAR_HEIGHT - 6}px` }}>
            {views.length === 0 ? (
              <Alert className={styles.emptyAlert} title="This window does not have any views." severity="warning" />
            ) : (selectedView?.components?.length ?? 0) === 0 ? (
              <Alert className={styles.emptyAlert} title="This view does not have any components." severity="warning" />
            ) : (
              <ComponentsWrapper components={components} viewId={selectedView?.id} />
            )}
          </div>
        </div>
      </TemplateSettingsProvider>
    </FeatureModelProvider>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    windowContainer: css`
      background-color: ${theme.colors.background.primary};
      height: 100%;
      border-width: ${WINDOW_BORDER}px;
      border-style: solid;
      border-radius: 2px;
    `,
    currentEdited: css`
      .react-grid-item:has(> * > * > &) {
        box-shadow: 0px 0px 0px 10px ${theme.colors.primary.transparent};
      }
    `,
    viewsContainer: css`
      overflow-y: hidden;
      overflow-x: hidden;
    `,
    emptyAlert: css`
      margin: ${theme.spacing(1)};
    `,
  };
};

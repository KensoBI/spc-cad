import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import React from 'react';
import { css } from 'emotion';
import { useCurrentViewComponentProvider } from './CurrentViewComponentProvider';
import { TimeSeriesComponentEditor } from '../../components/TimeSeriesComponent/editor/TimeSeriesComponentEditor';
import { TableComponentEditor } from '../../components/TableComponent/editor/TableComponentEditor';
import { GrideComponentEditor } from 'components/Annotations/window/components/GridComponent/editor/GridComponentEditor';
import { useEditedViewComponent } from './EditedViewComponentProvider';
import { useFocusedViewSetters } from '../../FocusProvider';

export function ViewEditor() {
  const styles = useStyles2(getStyles);
  const { viewComponent, setViewComponent } = useCurrentViewComponentProvider();
  const { ids } = useEditedViewComponent();

  const { setFocuseViewComponentId, setFocusedViewItemId } = useFocusedViewSetters();

  React.useEffect(() => {
    setFocuseViewComponentId(ids?.componentId);
    setFocusedViewItemId(ids?.viewId);
  }, [ids?.componentId, ids?.viewId, setFocuseViewComponentId, setFocusedViewItemId]);

  return (
    <div className={styles.container}>
      <div className={styles.viewNameContainer}>
        <input
          className={styles.viewNameInput}
          type="text"
          value={viewComponent.title}
          onChange={(e) => {
            setViewComponent({ ...viewComponent, title: e.target.value });
          }}
        />
      </div>
      {viewComponent.type === 'table' ? (
        <TableComponentEditor viewComponent={viewComponent} setViewComponent={setViewComponent} />
      ) : viewComponent.type === 'timeseries' ? (
        <TimeSeriesComponentEditor viewComponent={viewComponent} setViewComponent={setViewComponent} />
      ) : viewComponent.type === 'grid' ? (
        <GrideComponentEditor viewComponent={viewComponent} setViewComponent={setViewComponent} />
      ) : (
        <></>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      min-height: 300px;
      position: relative;
      max-height: 40vh;
      overflow-y: auto;
    `,
    viewName: css`
      color: ${theme.colors.text.secondary};
      font-size: 11px;
      margin-left: 35px;
    `,
    viewNameContainer: css`
      margin-left: ${theme.spacing(2)};
      margin-right: ${theme.spacing(2)};
    `,
    viewNameInput: css`
      background: #0000;
      border-radius: 3px;
      box-shadow: none;
      font-size: 20px;
      font-weight: 600;
      height: 32px;
      line-height: 24px;
      min-height: 24px;
      padding: 4px 8px;
      resize: none;
      outline: none;
      display: block;
      -webkit-appearance: none;

      &:focus {
        background-color: ${theme.colors.background.canvas};
        box-shadow: inset 0 0 0 2px ${theme.colors.primary.border};
      }
    `,
  };
};

import { InlineSwitch, useStyles2 } from '@grafana/ui';
import React from 'react';
import { defaultGridSettings, GridCell, GridSettings, ViewComponent } from 'types/ViewComponentSettings';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from 'emotion';
import { defaults } from 'lodash';
import { ColumnsDnd } from './ColumnsDnd';
import { CellSettings } from './CellSettings';

type Props = {
  viewComponent: ViewComponent;
  setViewComponent: (value: ViewComponent) => void;
};

export function GrideComponentEditor({ viewComponent, setViewComponent }: Props) {
  const styles = useStyles2(getStyles);
  const [selectedColumnId, setSelectedColumnId] = React.useState<string | undefined>();

  const settings = React.useMemo(() => {
    const s = viewComponent?.settings?.grid;
    return s != null ? defaults(s, defaultGridSettings) : defaultGridSettings;
  }, [viewComponent?.settings?.grid]);

  const setSettings = React.useCallback(
    (newSettings: GridSettings) => {
      setViewComponent({ ...viewComponent, settings: { ...(viewComponent.settings ?? {}), grid: newSettings } });
    },
    [setViewComponent, viewComponent]
  );

  const selectedCell = React.useMemo(() => {
    return settings.cells?.find((cell) => cell.id === selectedColumnId);
  }, [selectedColumnId, settings.cells]);

  const setSelectedCell = React.useMemo(() => {
    if (selectedCell == null) {
      return undefined;
    }
    return (newCell: GridCell) => {
      const prev = settings.cells ?? [];
      const index = prev.findIndex((cell) => cell.id === selectedColumnId);
      if (index >= 0) {
        prev[index] = newCell;
        setSettings({ ...settings, cells: [...prev] });
      }
    };
  }, [selectedCell, selectedColumnId, setSettings, settings]);

  return (
    <div className={styles.container}>
      <div className={styles.basicOptions}>
        <div></div>
        <InlineSwitch
          label="Show headers"
          showLabel
          value={settings.showHeaders}
          onChange={(e) => setSettings({ ...settings, showHeaders: e.currentTarget.checked })}
        />
      </div>

      <ColumnsDnd
        setSettings={setSettings}
        settings={settings}
        setSelectedColumnId={setSelectedColumnId}
        selectedColumnId={selectedColumnId}
      />
      <div className={styles.cellSettings}>
        {selectedCell && setSelectedCell ? (
          <CellSettings key={`cell-${selectedCell.id}`} cell={selectedCell} setCell={setSelectedCell} />
        ) : (
          <div>Click on a column to edit.</div>
        )}
      </div>
    </div>
  );
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      margin-top: ${theme.spacing(1)};
    `,
    basicOptions: css`
      display: flex;

      & > :first-child {
        flex: 1;
      }
    `,
    cellSettings: css`
      background-color: ${theme.colors.background.canvas};
      padding: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius(2)};
      margin-top: ${theme.spacing(1)};
    `,
  };
};

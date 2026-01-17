import { GrafanaTheme2, toFixed } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { GridCell, GridSettings } from 'types/ViewComponentSettings';
import { css } from 'emotion';
import { StyledCell } from './StyledCell';
import { toNumber } from 'lodash';
import { GRID_COMPONENT_CELL_HEIGHT, GRID_DEFAULT_DECIMALS, PRINT_COLOR_ADJUST } from 'constants/global';

type Props = { featureModel: FeatureModelAnnotated; settings: GridSettings };

export function GridComponent({ featureModel, settings }: Props) {
  const styles = useStyles2(getStyles);
  return (
    <div className={`grid-container ${styles.container}`}>
      {settings.showHeaders && (
        <div className={`grid-header ${styles.gridContainer}`}>
          {settings.cells?.map((el, index) => (
            <div key={`header-${el.id}-${index}`} className={styles.cell}>
              {el.name}
            </div>
          ))}
        </div>
      )}
      <div className={styles.gridContainer}>
        {settings.cells?.map((el, index) => (
          <StyledCell className={styles.cell} key={`value-${el.id}-${index}`} featureModel={featureModel} gridCell={el}>
            {el.staticText ? (
              el.value.static ?? ''
            ) : el.value.dynamic ? (
              <DynamicCell formatters={el.formatters} settings={el.value.dynamic} featureModel={featureModel} />
            ) : (
              ''
            )}
          </StyledCell>
        ))}
      </div>
    </div>
  );
}

type DynamicCellProps = {
  settings: NonNullable<GridCell['value']['dynamic']>;
  featureModel: FeatureModelAnnotated;
  formatters: GridCell['formatters'];
};

function DynamicCell({ settings, featureModel, formatters }: DynamicCellProps) {
  const value = React.useMemo(() => {
    const row = featureModel.feature.characteristics?.[settings.control];
    if (row == null) {
      return undefined;
    }
    const value = row.table?.[settings.column];

    const asNumber = toNumber(value);

    if (isFinite(asNumber)) {
      return toFixed(asNumber, formatters?.number?.decimals ?? GRID_DEFAULT_DECIMALS);
    }

    return value;
  }, [featureModel.feature.characteristics, formatters, settings.column, settings.control]);

  return <>{value}</>;
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      padding: ${theme.spacing(0, 0.25)};
    `,
    gridContainer: css`
      height: ${GRID_COMPONENT_CELL_HEIGHT}px;
      display: flex;
      & > * {
        flex: 1;
        line-height: ${GRID_COMPONENT_CELL_HEIGHT}px;
        background-color: rgba(124, 124, 124, 0.1);
        text-align: center;
        margin: 0.5px;
      }

      &.grid-header {
        font-weight: 600;
      }
    `,
    cell: css`
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      ${PRINT_COLOR_ADJUST}
    `,
  };
};

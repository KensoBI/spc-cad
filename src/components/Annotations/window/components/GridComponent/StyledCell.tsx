import { getTextColorForBackground, useStyles2 } from '@grafana/ui';
import { getFeatureColor } from 'feature/data/getFeatureColor';
import React from 'react';
import { FeatureModelAnnotated } from 'types/AnnotationModel';
import { GridCell } from 'types/ViewComponentSettings';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from 'emotion';
import { ensureUrlProtocol } from 'utils/urlUtils';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  featureModel: FeatureModelAnnotated;
  gridCell: GridCell;
  className?: string;
};

export function StyledCell({ children, featureModel, gridCell, className }: React.PropsWithChildren<Props>) {
  const colorMapping = gridCell.colorMapping;
  const styles = useStyles2(getStyles);

  const colorMappingDynamicLeftside = React.useMemo(() => {
    return colorMapping.map((el) => ({
      ...el,
      column: gridCell.value.dynamic?.column ?? '',
      characteristic_id: gridCell.value.dynamic?.characteristic_id ?? '',
    }));
  }, [colorMapping, gridCell.value.dynamic?.column, gridCell.value.dynamic?.characteristic_id]);

  const staticLeftValue = React.useMemo(() => {
    return gridCell.staticText ? gridCell.value.static ?? '' : undefined;
  }, [gridCell.staticText, gridCell.value.static]);

  const backgroundColor = React.useMemo(
    () => getFeatureColor(featureModel.feature, colorMappingDynamicLeftside, staticLeftValue),
    [colorMappingDynamicLeftside, featureModel.feature, staticLeftValue]
  );

  const color = React.useMemo(
    () => (backgroundColor ? getTextColorForBackground(backgroundColor) : undefined),
    [backgroundColor]
  );

  const Wrapper = React.useMemo(() => {
    if (gridCell.link?.url != null) {
      const LinkWrap = ({ children }: React.PropsWithChildren<{}>) => {
        const newTab = gridCell.link?.openInNewTab === true;

        return (
          <a
            className={styles.link}
            href={ensureUrlProtocol(gridCell.link?.url ?? '#')}
            target={newTab ? '_blank' : '_self'}
            rel="noopener noreferrer"
          >
            {children}
          </a>
        );
      };
      return LinkWrap;
    }

    const NoWrap = ({ children }: React.PropsWithChildren<{}>) => <>{children}</>;
    return NoWrap;
  }, [gridCell.link?.openInNewTab, gridCell.link?.url, styles.link]);

  return (
    <div className={className} style={{ backgroundColor, color }}>
      <Wrapper>{children}</Wrapper>
      {gridCell.suffix ? <span className={styles.suffix}>{gridCell.suffix}</span> : <></>}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    link: css`
      text-decoration: underline;
      color: inherit;

      &:hover,
      &:active {
        opacity: 0.8;
      }
    `,
    suffix: css`
      padding-left: ${theme.spacing(1)};
    `,
  };
};

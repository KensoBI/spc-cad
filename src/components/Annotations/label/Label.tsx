import React from 'react';
import { css } from 'emotion';
import { GrafanaTheme2 } from '@grafana/data';
import { getTextColorForBackground, useStyles2 } from '@grafana/ui';
import { useOnCloseAnnotation } from '../useOnCloseAnnotation';
import { useOnPin } from '../useOnPin';
import { useDefaultColor } from '../useDefaultColor';
import { useSameCoordsClick } from 'utils/sameCoordsClick';

export type LabelProps = {
  title?: string;
  color?: string;
  isEditing?: boolean;
  icon?: string;
  uid: string;
};

export function Label({ uid, color, isEditing, icon, title }: LabelProps) {
  const styles = useStyles2(getStyles);
  const onCloseAnnotation = useOnCloseAnnotation(uid);

  const containerClassNames = React.useMemo(
    () => (isEditing ? styles.labelContainerEditing : undefined),
    [isEditing, styles.labelContainerEditing]
  );

  const defaultColor = useDefaultColor();
  const headerColor = color ?? defaultColor;
  const titleColor = getTextColorForBackground(headerColor);

  const [headerStyle, iconStyle] = React.useMemo(() => {
    if (headerColor && titleColor) {
      return [
        {
          backgroundColor: headerColor,
          color: titleColor,
        },
        { backgroundColor: titleColor },
      ];
    }
    return [{}, {}];
  }, [headerColor, titleColor]);

  const onPin = useOnPin(uid);

  const onPinMouseEvents = useSameCoordsClick(onPin);
  const onCloseClickMouseEvents = useSameCoordsClick(onCloseAnnotation);

  return (
    <div className={containerClassNames}>
      <div style={headerStyle} className={styles.labelHeader} aria-label="Box Title">
        {icon && (
          <div>
            <i className={'fa box-header-icon gicon ' + icon} style={iconStyle} />
          </div>
        )}

        <div className={styles.boxHeaderName} {...onPinMouseEvents}>
          <span className="panel-title">{title}</span>
        </div>
        <div className={styles.boxHeaderTools}>
          <i {...onCloseClickMouseEvents} className={`fa fa-times close-link onHover`} />
        </div>
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    labelContainerEditing: css`
      border-style: solid;
      border-color: goldenrod;
      border-width: 2px;
    `,
    labelHeader: css`
      height: 32px;
      display: flex;
      width: 100%;
      cursor: pointer;
      align-items: center;
      border-radius: ${theme.spacing(0.5)};

      &:not(:hover) .onHover {
        visibility: hidden;
      }

      .onHover {
        cursor: pointer;
        visibility: visible;
        &:hover {
          color: rgba(255, 255, 255, 0.6);
        }
      }

      &:hover {
        -webkit-transition: background-color 0.1s ease-in-out;
        -o-transition: background-color 0.1s ease-in-out;
        transition: background-color 0.1s ease-in-out;
        color: ${theme.isDark ? '#d8d9da' : theme.colors.text.primary};
        background-color: ${theme.isDark ? '#262628' : '#e9edf2'};
      }
    `,
    boxHeaderName: css`
      vertical-align: middle;
      font-weight: 500;
      flex-basis: 0;
      -webkit-box-flex: 1;
      flex-grow: 0;
      display: flex;
      cursor: pointer;
      white-space: nowrap;
      margin-left: 8px;
      margin-right: 10px;
    `,
    boxHeaderTools: css`
      margin-right: 8px;
      vertical-align: middle;
      horiz-align: center;
      flex-basis: 0;
      -webkit-box-flex: 1;
      flex-grow: 0;
      display: flex;
      margin-left: auto;
      -webkit-box-pack: center;
      -webkit-justify-content: center;
      -ms-flex-pack: center;
      justify-content: center;

      -webkit-box-align: center;
      -webkit-align-items: center;
      -ms-flex-align: center;
      align-items: center;
    `,
  };
};

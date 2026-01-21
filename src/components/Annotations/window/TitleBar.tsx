import React from 'react';
import { LinkSettings } from 'types/Annotation';
import { Button, useStyles2 } from '@grafana/ui';
import { css, cx } from 'emotion';
import { GrafanaTheme2 } from '@grafana/data';
import { useWindowView } from './useWindowView';
import { useFeatureModel } from './FeatureModelProvider';
import { Popover, usePopoverTrigger } from '../../popover/Popover';
import { PopoverContainer } from '../../popover/PopoverContainer';
import { MenuItem } from '../../popover/MenuItem';
import { useTemplateSettings } from './settings/TemplateSettings';
import { useSameCoordsClick } from 'utils/sameCoordsClick';
import { useFocusedViewGetters, useFocusedViewSetters } from './FocusProvider';
import { TITLE_BAR_HEIGHT } from 'constants/global';
import { PositionModeButton } from './PositionModeButton';

type BasicTitleProps = {
  title: string;
};
type LinkTitleProps = BasicTitleProps & {
  link: LinkSettings;
  titleColor?: string;
};
function BasicTitle({ title }: BasicTitleProps) {
  const styles = useStyles2(getStyles);
  return <span className={styles.title}> {title}</span>;
}
function LinkTitle({ title, link, titleColor }: LinkTitleProps) {
  const styles = useStyles2(getStyles);
  return (
    <a
      className={`${styles.title} link`}
      href={link.url}
      rel="noreferrer"
      target={link.openInNewTab ? '_blank' : '_self'}
      style={{
        color: titleColor,
      }}
    >
      {' '}
      {title}{' '}
    </a>
  );
}

function Title({ titleColor }: Pick<LinkTitleProps, 'titleColor'>) {
  const styles = useStyles2(getStyles);
  const fma = useFeatureModel();
  const title = fma.annotation.titleColumn ?? '';
  const link = fma.annotation.link;

  const [viewId, setViewId] = useWindowView(fma.annotation);
  const { popoverProps, triggerClick } = usePopoverTrigger();
  const mouseEvents = useSameCoordsClick(triggerClick);
  const { templateModel, openTemplateSettings } = useTemplateSettings();

  const views = React.useMemo(() => templateModel.template.views ?? [], [templateModel.template.views]);
  const { focusedViewItemId } = useFocusedViewGetters();
  const { setFocusedViewItemId, setFocuseViewComponentId } = useFocusedViewSetters();

  const menu = React.useMemo(() => {
    return (
      <PopoverContainer>
        {views.map((viewItem, i) => (
          <MenuItem
            key={i}
            selected={viewId === viewItem.id}
            onClick={() => {
              setFocusedViewItemId(undefined);
              setFocuseViewComponentId(undefined);
              setViewId(viewItem.id);
              popoverProps.onClose();
            }}
            className={cx({
              [styles.focusedMenuItem]: focusedViewItemId === viewItem.id,
            })}
          >
            <div className={styles.viewsItem}>{viewItem.title}</div>
            <div className={styles.viewEditButton}>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  popoverProps.onClose();
                  openTemplateSettings('views');
                  setFocusedViewItemId(viewItem.id);
                }}
                variant="secondary"
                fill="text"
                size="sm"
                icon="edit"
                aria-label="Edit view"
              />
            </div>
          </MenuItem>
        ))}
      </PopoverContainer>
    );
  }, [
    focusedViewItemId,
    openTemplateSettings,
    popoverProps,
    setFocuseViewComponentId,
    setFocusedViewItemId,
    setViewId,
    styles.focusedMenuItem,
    styles.viewEditButton,
    styles.viewsItem,
    viewId,
    views,
  ]);

  const isLink = React.useMemo(() => !!(link && link.url && link.url.length > 0), [link]);

  const focusedView = React.useMemo(() => views.find((v) => v.id === focusedViewItemId), [focusedViewItemId, views]);

  const selectedView = React.useMemo(() => {
    if (focusedView) {
      return focusedView;
    }
    return views?.find((el) => el.id === viewId);
  }, [focusedView, viewId, views]);

  const notEmpty = React.useMemo(() => Array.isArray(views) && views.length > 0, [views]);
  const conditionalMouseEvents = React.useMemo(() => {
    return notEmpty ? mouseEvents : {};
  }, [mouseEvents, notEmpty]);

  React.useEffect(() => {
    if (views.length === 0) {
      popoverProps.onClose();
    }
  }, [popoverProps, views.length]);

  return (
    <>
      <div {...conditionalMouseEvents} className={`${styles.viewsDropdownContainer} no-drag`}>
        {isLink ? <LinkTitle link={link!} title={title} titleColor={titleColor} /> : <BasicTitle title={title} />}
        {selectedView != null && (
          <span>
            <i className="fa fa-angle-right"></i>
            <i>{selectedView.title}</i>
          </span>
        )}
        {notEmpty && <i className="fa fa-caret-down"></i>}
      </div>
      <Popover {...popoverProps}>{menu}</Popover>
    </>
  );
}

function TemplateSettingsButton() {
  const { openTemplateSettings, closeTemplateSettings, open } = useTemplateSettings();
  const mouseEvents = useSameCoordsClick(
    React.useCallback(() => {
      if (open) {
        closeTemplateSettings();
      } else {
        openTemplateSettings();
      }
    }, [closeTemplateSettings, open, openTemplateSettings])
  );

  return <i {...mouseEvents} className={`fa fa-cog onHover`} />;
}

type TitleBarProps = {
  titleColor?: string;
  headerColor?: string;
  onCloseClick?: () => void;
  onUnPin?: () => void;
};
export function TitleBar({ titleColor, headerColor, onCloseClick, onUnPin }: TitleBarProps) {
  const styles = useStyles2(getStyles);
  const headerStyle = React.useMemo(
    () => (headerColor ? { backgroundColor: headerColor, color: titleColor } : {}),
    [headerColor, titleColor]
  );
  const fma = useFeatureModel();
  const posMode = fma.feature.positionMode;

  const onUnPinMouseEvents = useSameCoordsClick(onUnPin);
  const onCloseClickMouseEvents = useSameCoordsClick(onCloseClick);

  return (
    <div className="box-drag-handle">
      <div style={headerStyle} className={styles.titleBar} aria-label="Balloon Title">
        <Title titleColor={titleColor} />
        <div style={{ flexGrow: 1 }} />
        <div className={styles.rightButtons}>
          <TemplateSettingsButton />
          <PositionModeButton />
          {posMode !== 'noPosition' && (
            <i {...onUnPinMouseEvents} className="fa fa-thumb-tack box-pinned onHover" />
          )}
          <i {...onCloseClickMouseEvents} className="fa fa-times close-link onHover" />
        </div>
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    titleBar: css`
      position: relative;
      background-color: #343436;
      height: ${TITLE_BAR_HEIGHT}px;
      display: flex;
      width: 100%;
      cursor: move;
      line-height: ${TITLE_BAR_HEIGHT}px;
      gap: 10px;
      padding-right: ${theme.spacing(0.5)};
      padding-left: ${theme.spacing(0.5)};

      &:not(:hover) .onHover {
        display: none;
      }

      .onHover {
        cursor: pointer;
        &:hover {
          color: rgba(255, 255, 255, 0.6);
        }
      }
    `,
    title: css`
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      font-weight: 500;

      &.link {
        text-decoration: underline;
        text-underline-position: under;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
          text-underline-position: under;
        }
      }
    `,
    viewsDropdownContainer: css`
      white-space: nowrap;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;

      & > * {
        display: inline;
      }

      &:hover {
        color: rgba(255, 255, 255, 0.6);
      }

      i {
        margin-left: 5px;

        &.fa-caret-down {
          opacity: 0.5;
        }
      }
    `,
    rightButtons: css`
      white-space: nowrap;

      i {
        margin: ${theme.spacing(0, 0.5)};
      }
    `,
    focusedMenuItem: css`
      background-color: ${theme.colors.action.hover};
    `,
    viewsItem: css`
      flex-grow: 1;
    `,
    viewEditButton: css`
      visibility: hidden;

      *:hover > & {
        visibility: visible;
      }
    `,
  };
};

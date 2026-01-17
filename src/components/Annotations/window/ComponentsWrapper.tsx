import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { css, cx } from 'emotion';
import { useStyles2 } from '@grafana/ui';
import { useFocusedViewGetters, useFocusedViewSetters } from './FocusProvider';
import { useTemplateSettings } from './settings/TemplateSettings';

type Props = {
  components: JSX.Element[];
  viewId: string | undefined;
};

export function ComponentsWrapper({ components, viewId }: Props) {
  const styles = useStyles2(getStyles);
  const wrapped = React.useMemo(() => {
    return components.map((component, index) => (
      <Container viewComponentId={`${component.key}`} key={`container-${component.key}-${index}`} viewId={viewId}>
        {component}
      </Container>
    ));
  }, [components, viewId]);

  return <div className={styles.wrapper}>{wrapped}</div>;
}

function Container({
  children,
  viewComponentId,
  viewId,
}: React.PropsWithChildren<{ viewComponentId: string; viewId: string | undefined }>) {
  const { focusedViewComponentId } = useFocusedViewGetters();
  const styles = useStyles2(getStyles);
  const { openTemplateSettings } = useTemplateSettings();
  const { setFocusedViewItemId, setFocuseViewComponentId } = useFocusedViewSetters();

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    openTemplateSettings('views');
    setFocusedViewItemId(viewId);
    setFocuseViewComponentId(viewComponentId);
  };

  return (
    <div
      className={cx({
        [styles.container]: true,
        [styles.focused]: focusedViewComponentId === viewComponentId,
      })}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
      height: 100%;
    `,
    focused: css`
      animation: blink 610ms ease-in-out 1;

      @keyframes blink {
        0% {
          filter: brightness(1);
        }
        50% {
          filter: brightness(1.5);
        }
        100% {
          filter: brightness(1);
        }
      }
    `,
    container: css`
      min-height: 50px;
      overflow-y: auto;

      &:has(.grid-container) {
        min-height: 32px;
        overflow-y: hidden;
      }

      &:has(.timeseries-container) {
        flex-grow: 1;
        min-height: 100px;
      }
    `,
  };
};

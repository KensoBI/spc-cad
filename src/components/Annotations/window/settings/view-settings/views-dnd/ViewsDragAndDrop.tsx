import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import React from 'react';
import { css } from 'emotion';
import { DragDropContext, Droppable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { SingleViewDraggable } from './SingleViewDraggable';
import { COMPONENTS_DROPPABLE_TYPE, VIEWS_DROPPABLE_ID, VIEWS_DROPPABLE_TYPE } from '../constants';
import { useTemplateSettings } from '../../TemplateSettings';
import { useSetViews } from '../useSetViews';
import { reorder } from 'utils/reorder';
import { useFocusedViewSetters } from '../../../FocusProvider';

export function ViewsDragAndDrop() {
  const styles = useStyles2(getStyles);
  const { templateModel } = useTemplateSettings();

  const views = React.useMemo(() => templateModel.template.views ?? [], [templateModel.template.views]);
  const setViews = useSetViews();

  const { setFocusedViewItemId } = useFocusedViewSetters();

  const onDragEnd = React.useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      const dst = result.destination;
      const src = result.source;

      if (dst == null) {
        return;
      }

      if (result.type === VIEWS_DROPPABLE_TYPE) {
        if (dst.droppableId === src.droppableId && src.droppableId === VIEWS_DROPPABLE_ID) {
          setViews((prev) => reorder(prev, src.index, dst.index));
        } else {
          console.warn('wrong d&d on views', result);
        }
      } else if (result.type === COMPONENTS_DROPPABLE_TYPE) {
        if (dst.droppableId === src.droppableId) {
          setViews((prev) => {
            const viewItem = prev.find((el) => el.id === dst.droppableId);
            if (viewItem == null) {
              return prev;
            }
            setFocusedViewItemId(viewItem.id);
            viewItem.components = reorder(viewItem.components, src.index, dst.index);
            return [...prev];
          });
        } else {
          setViews((prev) => {
            const viewItemSource = prev.find((el) => el.id === src.droppableId);
            if (viewItemSource == null) {
              return prev;
            }
            const viewItemDestination = prev.find((el) => el.id === dst.droppableId);
            if (viewItemDestination == null) {
              return prev;
            }
            setFocusedViewItemId(viewItemDestination.id);
            const [removed] = viewItemSource.components.splice(src.index, 1);
            viewItemDestination.components.splice(dst.index, 0, removed);
            return [...prev];
          });
        }
      } else {
        console.warn('unknown d&d result', result);
      }
    },
    [setFocusedViewItemId, setViews]
  );

  const onAddView = () => {
    const allNames = new Set(views.map((v) => v.title.toLowerCase()));
    const baseName = 'View';
    let newName = baseName;
    let i = 0;
    while (allNames.has(newName.toLowerCase()) && i < 1000) {
      newName = baseName + (i === 0 ? '' : ` ${i}`);
      i++;
    }
    setViews((prev) => [
      ...prev,
      { title: newName, components: [], id: (Math.random() + 1).toString(36).substring(7) },
    ]);
  };

  return (
    <div className={styles.container}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={VIEWS_DROPPABLE_ID} type={VIEWS_DROPPABLE_TYPE} direction="vertical">
          {(provided, snapshot) => (
            <div className={styles.droppable} {...provided.droppableProps} ref={provided.innerRef}>
              {views.map((view, index) => (
                <SingleViewDraggable key={view.id} viewItem={view} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className={styles.addView}>
        <div onClick={onAddView}>
          <i className="fa fa-plus"></i> Add View
        </div>
      </div>
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
    droppable: css`
      padding: ${theme.spacing(0.5)};
    `,
    addView: css`
      padding: ${theme.spacing(0, 1.5)};

      & > div {
        user-select: none;
        padding: ${theme.spacing(0.5, 0)};
        margin-bottom: ${theme.spacing(0.5)};
        background-color: ${theme.colors.background.primary};
        border: 2px dashed ${theme.colors.border.medium};
        border-radius: ${theme.shape.borderRadius(1)};
        text-align: center;
        color: ${theme.colors.border.strong};
        cursor: pointer;

        &:hover {
          color: ${theme.colors.success.main};
          border: 2px dashed ${theme.colors.border.strong};
        }
      }
    `,
  };
};

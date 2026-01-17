import React from 'react';
import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { ViewComponent, ViewItem } from 'types/ViewComponentSettings';
import { useDraggableInPortal } from '../../../../../../utils/useDraggablePortal';
import { GrafanaTheme2 } from '@grafana/data';
import { Button, Icon, useStyles2 } from '@grafana/ui';
import { css, cx } from 'emotion';
import { COMPONENTS_DROPPABLE_TYPE, viewComponentsMap } from '../constants';
import { useEditedViewComponent, ViewComponentIds } from '../EditedViewComponentProvider';
import { useSetViews } from '../useSetViews';
import { generateNewItem } from './generateNewItem';
import { cloneDeep } from 'lodash';
import { useFocusedViewGetters, useFocusTriggerProps } from 'components/Annotations/window/FocusProvider';

type Props = {
  viewItem: ViewItem;
};

export function ViewComponentsDroppable({ viewItem }: Props) {
  return (
    <Droppable droppableId={viewItem.id} type={COMPONENTS_DROPPABLE_TYPE} ignoreContainerClipping={false}>
      {(dropProvided: DroppableProvided, dropSnapshot: DroppableStateSnapshot) => (
        <DroppableContent dropProvided={dropProvided} dropSnapshot={dropSnapshot} viewItem={viewItem} />
      )}
    </Droppable>
  );
}

type ContentProps = {
  dropProvided: DroppableProvided;
  dropSnapshot: DroppableStateSnapshot;
  viewItem: ViewItem;
};

function DroppableContent({ dropProvided, dropSnapshot, viewItem }: ContentProps) {
  const styles = useStyles2(getStyles);

  const renderDraggable = useDraggableInPortal();
  const { setIds } = useEditedViewComponent();
  const setViews = useSetViews();

  const onRemove = React.useCallback(
    (itemIndex: number) => {
      setViews((prev) => {
        const index = prev.findIndex((el) => el.components === viewItem.components);
        if (index >= 0) {
          prev[index].components.splice(itemIndex, 1);
        }
        return [...prev];
      });
    },
    [setViews, viewItem.components]
  );

  const onCopy = React.useCallback(
    (itemIndex: number) => {
      setViews((prev) => {
        const index = prev.findIndex((el) => el.components === viewItem.components);
        if (index >= 0) {
          const toCopy = prev[index].components[itemIndex];
          const newItem = generateNewItem(prev[index].components, toCopy.title, toCopy.type);
          const duplicatedItem = {
            ...newItem,
            settings: cloneDeep(toCopy.settings),
          };
          prev[index].components.splice(itemIndex + 1, 0, duplicatedItem);
        }
        return [...prev];
      });
    },
    [setViews, viewItem.components]
  );

  return (
    <div className={styles.container} {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
      {viewItem.components.length > 0 ? (
        <>
          {viewItem.components.map((component: ViewComponent, index: number) => (
            <Draggable key={component.id} draggableId={component.id} index={index}>
              {renderDraggable((provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <OneComponentDraggable
                  provided={provided}
                  snapshot={snapshot}
                  component={component}
                  setIds={setIds}
                  onCopy={() => onCopy(index)}
                  onRemove={() => onRemove(index)}
                  viewItem={viewItem}
                />
              ))}
            </Draggable>
          ))}
          {dropProvided.placeholder}
        </>
      ) : (
        <div
          className={cx({
            [styles.emptyBox]: true,
            [styles.emptyBoxActive]: dropSnapshot.isDraggingOver,
          })}
        >
          Empty view
        </div>
      )}
    </div>
  );
}

type OneComponentDraggableProps = {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  component: ViewComponent;
  setIds: (value: React.SetStateAction<ViewComponentIds | undefined>) => void;
  onCopy: () => void;
  onRemove: () => void;
  viewItem: ViewItem;
};

function OneComponentDraggable({
  provided,
  snapshot,
  component,
  setIds,
  onCopy,
  onRemove,
  viewItem,
}: OneComponentDraggableProps) {
  const styles = useStyles2(getStyles);

  const focusTriggerProps = useFocusTriggerProps(component.id, 'viewComponent');
  const { focusedViewComponentId, focusedViewItemId } = useFocusedViewGetters();

  const onEdit = () => setIds({ viewId: viewItem.id, componentId: component.id });

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={cx({
        [styles.item]: true,
        [styles.draggedItem]: snapshot.isDragging,
        [styles.focused]: focusedViewComponentId === component.id && focusedViewItemId === viewItem.id,
      })}
      {...focusTriggerProps}
      onDoubleClick={onEdit}
    >
      <div>
        <Icon name={viewComponentsMap[component.type].icon} className={styles.icon} /> {component.title}
      </div>
      <div>
        <Button onClick={onEdit} icon="edit" variant="primary" size="sm" fill="text" />
        <Button onClick={onCopy} icon="copy" variant="secondary" size="sm" fill="text" />
        <Button onClick={onRemove} icon="trash-alt" variant="secondary" size="sm" fill="text" />
      </div>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      padding: ${theme.spacing(0.5, 0, 0.5, 2)};
      transition: all 0.2s ease, opacity 0.1s ease;
      userselect: none;
    `,
    focused: css`
      background-color: ${theme.colors.action.focus};
    `,
    item: css`
      user-select: none;
      padding: ${theme.spacing(0.5, 0, 0.5, 2)};
      margin-bottom: ${theme.spacing(0.5)};
      background-color: ${theme.colors.background.primary};
      border: 1px solid ${theme.colors.border.weak};
      border-radius: ${theme.shape.borderRadius(1)};
      display: flex;

      & > div:first-child {
        flex-grow: 1;
      }
    `,
    draggedItem: css`
      background-color: ${theme.colors.background.canvas};
      box-shadow: ${theme.shadows.z3};
      border: 1px solid ${theme.colors.border.strong};
    `,
    emptyBox: css`
      user-select: none;
      padding: ${theme.spacing(0.5, 0, 0.5, 2)};
      margin-bottom: ${theme.spacing(0.5)};
      background-color: ${theme.colors.background.primary};
      border: 1px dashed ${theme.colors.border.medium};
      border-radius: ${theme.shape.borderRadius(1)};
      text-align: left;
      color: ${theme.colors.border.strong};
    `,
    emptyBoxActive: css`
      border: 1px dashed ${theme.colors.primary.border};
      color: ${theme.colors.primary.main};
    `,
    icon: css`
      margin-right: ${theme.spacing(0.5)};
    `,
  };
};

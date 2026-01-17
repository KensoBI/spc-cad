import React from 'react';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { ViewItem } from 'types/ViewComponentSettings';
import { useDraggableInPortal } from '../../../../../../utils/useDraggablePortal';
import { ViewComponentsDroppable } from './ViewComponentsDroppable';
import { GrafanaTheme2 } from '@grafana/data';
import { Button, ClickOutsideWrapper, Icon, Input, useStyles2 } from '@grafana/ui';
import { css, cx } from 'emotion';
import { useSameCoordsClick } from 'utils/sameCoordsClick';
import { Popover, usePopoverTrigger } from 'components/popover/Popover';
import { PopoverContainer } from 'components/popover/PopoverContainer';
import { MenuItem } from 'components/popover/MenuItem';
import { viewComponents } from '../constants';
import { CloseButton } from 'components/popover/CloseButton';
import { useSetViews } from '../useSetViews';
import { generateNewItem } from './generateNewItem';
import { useFocusedViewGetters, useFocusedViewSetters, useFocusTriggerProps } from '../../../FocusProvider';

type Props = {
  index: number;
  viewItem: ViewItem;
};

export function SingleViewDraggable({ index, viewItem }: Props) {
  const styles = useStyles2(getStyles);
  const renderDraggable = useDraggableInPortal();
  const setViews = useSetViews();

  const { popoverProps, triggerClick } = usePopoverTrigger();

  const menu = React.useMemo(() => {
    return (
      <PopoverContainer>
        {viewComponents.map((el) => (
          <MenuItem
            key={el.key}
            onClick={() => {
              setViews((prev) => {
                const index = prev.findIndex((el) => el.components === viewItem.components);
                if (index >= 0) {
                  prev[index].components = [
                    ...prev[index].components,
                    generateNewItem(prev[index].components, `${viewItem.title} ${el.title}`, el.key),
                  ];
                }
                return [...prev];
              });
              popoverProps.onClose();
            }}
          >
            <Icon name={el.icon} className={styles.icon} /> {el.title}
          </MenuItem>
        ))}
      </PopoverContainer>
    );
  }, [popoverProps, setViews, styles.icon, viewItem.components, viewItem.title]);

  const [isEditing, setIsEditing] = React.useState<boolean>(false);

  return (
    <>
      <Draggable draggableId={viewItem.id} index={index} isDragDisabled={isEditing}>
        {renderDraggable((provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
          <DraggableContent
            provided={provided}
            snapshot={snapshot}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            triggerClick={triggerClick}
            viewItem={viewItem}
          />
        ))}
      </Draggable>
      <Popover {...popoverProps}>
        <CloseButton onClick={() => popoverProps.onClose()} style={{ background: 'black', color: 'white' }} />
        {menu}
      </Popover>
    </>
  );
}

type ContentProps = {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  viewItem: ViewItem;
  triggerClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

function DraggableContent({ provided, snapshot, isEditing, setIsEditing, viewItem, triggerClick }: ContentProps) {
  const styles = useStyles2(getStyles);
  const setViews = useSetViews();

  const viewNameInputRef = React.useRef<HTMLInputElement | null>(null);

  const addViewComponentProps = useSameCoordsClick(triggerClick);

  const { setFocusedViewItemId } = useFocusedViewSetters();
  const { focusedViewItemId } = useFocusedViewGetters();
  const focusTriggerProps = useFocusTriggerProps(viewItem.id, 'viewItem');

  const onRemove = React.useCallback(() => {
    setViews((prev) => {
      const index = prev.findIndex((el) => el.components === viewItem.components);
      return prev.filter((_, i) => i !== index);
    });
    setFocusedViewItemId((prevId) => (prevId === viewItem.id ? undefined : prevId));
  }, [setFocusedViewItemId, setViews, viewItem.components, viewItem.id]);
  const onRemoveProps = useSameCoordsClick(onRemove);

  const startEdit = React.useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      if (viewNameInputRef.current) {
        viewNameInputRef.current.focus();
      }
    }, 100);
  }, [setIsEditing]);
  const editNameProps = useSameCoordsClick(startEdit);
  const updateName = React.useCallback(
    (newName: string) => {
      setViews((prev) => {
        const index = prev.findIndex((el) => el.components === viewItem.components);
        if (index >= 0) {
          prev[index].title = newName;
        }
        return [...prev];
      });
    },
    [setViews, viewItem.components]
  );

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cx({
        [styles.container]: true,
        [styles.draggedContainer]: snapshot.isDragging,
        [styles.focused]: focusedViewItemId === viewItem.id,
      })}
      {...focusTriggerProps}
    >
      <div {...provided.dragHandleProps} aria-label={`${viewItem.title} quote list`} className={styles.header}>
        <div>
          {!isEditing ? (
            <>
              {viewItem.title}
              <Button {...editNameProps} icon="edit" variant="primary" size="sm" fill="text" />
            </>
          ) : (
            <ClickOutsideWrapper onClick={() => setIsEditing(false)}>
              <Input
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                  }
                }}
                className={styles.nameInput}
                value={viewItem.title}
                onChange={(e) => {
                  updateName(e.currentTarget.value);
                }}
                ref={viewNameInputRef}
                suffix={
                  <Button onClick={() => setIsEditing(false)} icon="check" variant="success" size="sm" fill="text" />
                }
              />
            </ClickOutsideWrapper>
          )}
        </div>
        <div>
          {!isEditing ? (
            <>
              <Button {...addViewComponentProps} icon="plus-circle" variant="success" size="sm" fill="text" />
              <Button {...onRemoveProps} icon="trash-alt" variant="destructive" size="sm" fill="text" />
            </>
          ) : null}
        </div>
      </div>
      <ViewComponentsDroppable viewItem={viewItem} />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      // user-select: none;
      padding: ${theme.spacing(0.5)};
      margin: 0;
      border-radius: ${theme.shape.borderRadius(2)};

      &:focus {
        box-shadow: inset 0 0 10px blue;
      }
    `,
    focused: css`
      background-color: ${theme.colors.action.selected};
    `,
    draggedContainer: css`
      background: rgba(255, 255, 255, 0.1);
    `,
    header: css`
      border: 1px solid ${theme.colors.primary.main};
      border-radius: ${theme.shape.borderRadius(2)} ${theme.shape.borderRadius(2)} 0 ${theme.shape.borderRadius(2)};
      padding: ${theme.spacing(0.5, 0.5, 0.5, 2)};
      color: ${theme.colors.primary.text};
      display: flex;
      background-color: ${theme.colors.primary.transparent};

      & > div:first-child {
        flex-grow: 1;
      }
    `,
    icon: css`
      margin-right: ${theme.spacing(0.5)};
    `,
    nameInput: css`
      & input:focus {
        box-shadow: none !important;
      }
    `,
  };
};

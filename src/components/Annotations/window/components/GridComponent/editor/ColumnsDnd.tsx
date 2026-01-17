import { Button, useStyles2 } from '@grafana/ui';
import React from 'react';
import { css, cx } from 'emotion';
import {
  DragDropContext,
  Droppable,
  DropResult,
  ResponderProvided,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd';
import { useDraggableInPortal } from 'utils/useDraggablePortal';
import { reorder } from 'utils/reorder';
import { GridSettings } from 'types/ViewComponentSettings';
import { GrafanaTheme2 } from '@grafana/data';

type ColumnsDndProps = {
  settings: GridSettings;
  setSettings: (n: GridSettings) => void;
  selectedColumnId: string | undefined;
  setSelectedColumnId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const GRID_COLUMNS_DROPPABLE_ID = 'GRID_COLUMNS';
const GRID_COLUMNS_TYPE = 'GRID_COLUMN';
const REMOVE_GRID_COLUMN_ID = 'REMOVE_GRID_COLUMN';

export function ColumnsDnd({ settings, setSettings, setSelectedColumnId, selectedColumnId }: ColumnsDndProps) {
  const styles = useStyles2(getStyles);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const onDragEnd = React.useCallback(
    (result: DropResult, provided: ResponderProvided) => {
      setIsDragging(false);
      const dst = result.destination;
      const src = result.source;

      if (dst == null) {
        return;
      }

      if (result.type === GRID_COLUMNS_TYPE) {
        if (dst.droppableId === src.droppableId && src.droppableId === GRID_COLUMNS_DROPPABLE_ID) {
          setSettings({
            ...settings,
            cells: reorder(settings.cells ?? [], src.index, dst.index),
          });
        } else if (dst.droppableId === REMOVE_GRID_COLUMN_ID) {
          setSettings({
            ...settings,
            cells: (settings.cells ?? []).filter((_, index) => index !== src.index),
          });
        } else {
          console.warn('wrong d&d ID', result);
        }
      } else {
        console.warn('unknown d&d result', result);
      }
    },
    [setSettings, settings]
  );

  const renderDraggable = useDraggableInPortal();

  const onAddColumn = () => {
    const newId = (Math.random() + 1).toString(36).substring(7);
    setSettings({
      ...settings,
      cells: [
        ...(settings.cells ?? []),
        {
          id: newId,
          name: `col ${(settings.cells?.length ?? 0) + 1}`,
          colorMapping: [],
          staticText: true,
          value: {
            static: '',
          },
        },
      ],
    });
    setSelectedColumnId(newId);
  };

  return (
    <div className={styles.container}>
      <DragDropContext onDragEnd={onDragEnd} onDragStart={() => setIsDragging(true)}>
        <div className={styles.dndButtons}>
          <div>
            <h6>Columns</h6>
          </div>
          <Droppable droppableId={REMOVE_GRID_COLUMN_ID} type={GRID_COLUMNS_TYPE} direction="horizontal">
            {(provided, snapshot) => (
              <div
                className={cx({
                  [styles.deletingDroppable]: true,
                  [styles.activeDeletingDroppable]: snapshot.isDraggingOver,
                  [styles.hidedDeletingDroppable]: !isDragging,
                })}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                Drop here to delete a column.
              </div>
            )}
          </Droppable>
          <Button onClick={onAddColumn} icon="plus-circle" variant="success" size="sm" fill="text" />
        </div>

        <Droppable droppableId={GRID_COLUMNS_DROPPABLE_ID} type={GRID_COLUMNS_TYPE} direction="horizontal">
          {(provided, snapshot) => (
            <div className={styles.droppable} {...provided.droppableProps} ref={provided.innerRef}>
              {(settings.cells?.length ?? 0) > 0 ? (
                <>
                  {settings.cells?.map((column, index) => (
                    <Draggable key={`${column.id}-${index}`} draggableId={column.id} index={index}>
                      {renderDraggable((provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cx({
                            [styles.draggable]: true,
                            [styles.dragged]: snapshot.isDragging,
                          })}
                        >
                          <div
                            {...provided.dragHandleProps}
                            aria-label={`${column.name} quote list`}
                            className={cx({
                              [styles.columnItem]: true,
                              [styles.columnItemIsDeleting]:
                                snapshot.isDropAnimating && snapshot.draggingOver === REMOVE_GRID_COLUMN_ID,
                              [styles.selectedColumn]: selectedColumnId === column.id,
                            })}
                            onClick={() => setSelectedColumnId(selectedColumnId !== column.id ? column.id : undefined)}
                          >
                            {!column.name ? '-' : column.name}
                          </div>
                        </div>
                      ))}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </>
              ) : (
                <div className={styles.emptyBox}>Empty</div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background-color: ${theme.colors.background.canvas};
      padding: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius(2)};
      margin-top: ${theme.spacing(1)};
    `,
    droppable: css`
      display: flex;
      flex-direction: row;
      width: 500px;
      overflow-y: auto;
      padding: ${theme.spacing(0.5)};
    `,
    draggable: css`
      user-select: none;
      margin: 0;
      border-radius: ${theme.shape.borderRadius(2)};
    `,
    dragged: css``,
    columnItem: css`
      border-radius: ${theme.shape.borderRadius(1)};
      border: 1px solid ${theme.colors.primary.main};
      padding: ${theme.spacing(0.5)};
      margin: ${theme.spacing(0, 0.25)};
      color: ${theme.colors.primary.text};
      display: flex;
      background-color: ${theme.colors.primary.transparent};
      min-width: 50px;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      cursor: pointer !important;
      text-align: center;
    `,
    selectedColumn: css`
      background-color: ${theme.colors.primary.main};
      color: ${theme.colors.primary.contrastText};
    `,
    deletingDroppable: css`
      opacity: 0.7;
      transition: opacity 200ms ease-in-out;
      width: 100%;
      height: 25px;
      line-height: 25px;
      background-color: ${theme.colors.error.transparent};
      border: 1px solid ${theme.colors.error.border};
      border-radius: ${theme.shape.borderRadius(1)};
      display: flex;
      justify-content: center;
      flex-direction: row;
      font-size: ${theme.typography.bodySmall.fontSize};
    `,
    activeDeletingDroppable: css`
      opacity: 1;
    `,
    hidedDeletingDroppable: css`
      opacity: 0;
    `,
    dndButtons: css`
      display: flex;
      flex-direction: row;
      justify-content: end;
      gap: ${theme.spacing(1)};
    `,
    columnItemIsDeleting: css`
      visibility: hidden;
    `,
    emptyBox: css`
      flex: 1;
      user-select: none;
      padding: ${theme.spacing(0.5)};
      background-color: ${theme.colors.background.primary};
      border: 1px dashed ${theme.colors.border.medium};
      border-radius: ${theme.shape.borderRadius(1)};
      text-align: left;
      color: ${theme.colors.border.strong};
    `,
  };
};

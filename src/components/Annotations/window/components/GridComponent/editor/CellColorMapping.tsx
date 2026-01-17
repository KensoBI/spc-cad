import { GenericColorMapping } from '../../../GenericColorMapping';
import React from 'react';
import { GridCell } from 'types/ViewComponentSettings';
import { ConditionalStyle } from 'types/Annotation';

type Props = {
  setCell: (n: GridCell) => void;
  cell: GridCell;
};

export function CellColorMapping({ setCell, cell }: Props) {
  const update = React.useCallback(
    (newStyles: ConditionalStyle[]) => {
      setCell({ ...cell, colorMapping: newStyles });
    },
    [cell, setCell]
  );

  const constLeftSide = React.useMemo(() => {
    return cell.staticText
      ? '"' + (cell.value.static ?? 'value') + '"'
      : cell.value.dynamic
      ? `${cell.value.dynamic.control}(${cell.value.dynamic.column})`
      : 'value';
  }, [cell.staticText, cell.value.dynamic, cell.value.static]);

  return (
    <>
      <GenericColorMapping rows={cell.colorMapping} update={update} constLeftSide={constLeftSide} />
    </>
  );
}

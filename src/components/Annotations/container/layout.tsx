export type LayoutItem = {
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  moved?: boolean;
  meshX: number;
  meshY: number;
  static?: boolean;
};
export type Layout = LayoutItem[];
export type CompactType = 'horizontal' | 'vertical';

/**
 * Given two layoutitems, check if they collide.
 */
export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1.i === l2.i) {
    return false;
  } // same element
  if (l1.x + l1.w <= l2.x) {
    return false;
  } // l1 is left of l2
  if (l1.x >= l2.x + l2.w) {
    return false;
  } // l1 is right of l2
  if (l1.y + l1.h <= l2.y) {
    return false;
  } // l1 is above l2
  if (l1.y >= l2.y + l2.h) {
    return false;
  } // l1 is below l2
  return true; // boxes overlap
}

/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * @param  {Array}      layout            Full layout to modify.
 * @param  {LayoutItem} l                 element to move.
 * @param  {Number}     [x]               X position in grid units.
 * @param  {Number}     [y]               Y position in grid units.
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  x: number | undefined,
  y: number | undefined,
  isUserAction: boolean,
  preventCollision: boolean,
  compactType: CompactType
  //cols: number
): Layout {
  // Short-circuit if nothing to do.
  if (l.y === y && l.x === x) {
    return layout;
  }

  const oldX = l.x;
  const oldY = l.y;

  // This is quite a bit faster than extending the object
  if (typeof x === 'number') {
    l.x = x;
  }
  if (typeof y === 'number') {
    l.y = y;
  }
  l.moved = true;

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  let sorted = sortLayoutItems(layout);
  const movingUp =
    compactType === 'vertical' && typeof y === 'number'
      ? oldY >= y
      : compactType === 'horizontal' && typeof x === 'number'
      ? oldX >= x
      : false;
  if (movingUp) {
    sorted = sorted.reverse();
  }
  const collisions = getAllCollisions(sorted, l);

  // There was a collision; abort
  if (preventCollision && collisions.length) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }

  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];

    // Short circuit so we can't infinite loop
    if (collision.moved) {
      continue;
    }

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = moveElementAwayFromCollision(
        layout,
        collision,
        l,
        isUserAction,
        compactType
        //cols
      );
    } else {
      layout = moveElementAwayFromCollision(
        layout,
        l,
        collision,
        isUserAction,
        compactType
        //cols
      );
    }
  }

  return layout;
}

export function getInitialItemLayout(l: LayoutItem, fullLayout: Layout): LayoutItem {
  // Move it down, and keep moving it down if it's colliding.
  let collides;
  while ((collides = getFirstCollision(fullLayout, l))) {
    moveElementAwayFromCollision(fullLayout, collides, l, true, 'vertical');
  }
  return l;
}

/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction: boolean,
  compactType: CompactType
  //cols: number
): Layout {
  const compactH = compactType === 'horizontal';
  // Compact vertically if not set to horizontal
  const compactV = compactType !== 'horizontal';
  const preventCollision = false; // we're already colliding

  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.
  if (isUserAction) {
    // Reset isUserAction flag because we're not in the main collision anymore.
    isUserAction = false;

    // Make a mock item so we don't modify the item here, only modify in moveElement.
    const fakeItem: LayoutItem = {
      x: compactH ? Math.max(collidesWith.x - itemToMove.w, 0) : itemToMove.x,
      y: compactV ? Math.max(collidesWith.y - itemToMove.h, 0) : itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: '-1',
      meshX: -1,
      meshY: -1,
    };
  }

  return moveElement(
    layout,
    itemToMove,
    compactH ? itemToMove.x + 1 : undefined,
    compactV ? itemToMove.y + 1 : undefined,
    isUserAction,
    preventCollision,
    compactType
    //cols
  );
}

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
export function getFirstCollision(layout: Layout, layoutItem: LayoutItem): LayoutItem | undefined {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) {
      return layout[i];
    }
  }
  return undefined;
}

export function getAllCollisions(layout: Layout, layoutItem: LayoutItem): LayoutItem[] {
  return layout.filter((l) => collides(l, layoutItem));
}

/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
export function sortLayoutItems(layout: Layout): Layout {
  return sortLayoutItemsByRowCol(layout);
}

export function sortLayoutItemsByRowCol(layout: Layout): Layout {
  const rerArray: any[] = [];

  return rerArray.concat(layout).sort(function (a, b) {
    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    } else if (a.y === b.y && a.x === b.x) {
      // Without this, we can get different sort results in IE vs. Chrome/FF
      return 0;
    }
    return -1;
  });
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
export function getStatics(layout: Layout): LayoutItem[] {
  return layout.filter((l) => l.static);
}

// Fast path to cloning, since this is monomorphic
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  return {
    w: layoutItem.w,
    h: layoutItem.h,
    x: layoutItem.x,
    y: layoutItem.y,
    i: layoutItem.i,
    moved: Boolean(layoutItem.moved),
    static: Boolean(layoutItem.static),
    meshX: layoutItem.meshX,
    meshY: layoutItem.meshY,
  };
}

/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
export function bottom(layout: Layout): number {
  let max = 0,
    bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) {
      max = bottomY;
    }
  }
  return max;
}

/**
 * Compact an item in the layout.
 */
export function compactItem(
  compareWith: Layout,
  l: LayoutItem,
  compactType: CompactType,
  //cols: number,
  fullLayout: Layout
): LayoutItem {
  const compactV = compactType === 'vertical';
  const compactH = compactType === 'horizontal';
  if (compactV) {
    // Bottom 'y' possible is the bottom of the layout.
    // This allows you to do nice stuff like specify {y: Infinity}
    // This is here because the layout must be sorted in order to get the correct bottom `y`.
    l.y = Math.min(bottom(compareWith), l.y);
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  } else if (compactH) {
    l.y = Math.min(bottom(compareWith), l.y);
    // Move the element left as far as it can go without colliding.
    while (l.x > 0 && !getFirstCollision(compareWith, l)) {
      l.x--;
    }
  }

  // Move it down, and keep moving it down if it's colliding.
  let collides;
  while ((collides = getFirstCollision(compareWith, l))) {
    if (compactH) {
      resolveCompactionCollision(fullLayout, l, collides.x + collides.w, 'x');
    } else {
      resolveCompactionCollision(fullLayout, l, collides.y + collides.h, 'y');
    }
    // Since we can't grow without bounds horizontally, if we've overflown, let's move it down and try again.
    //if (compactH && l.x + l.w > cols) {
    //	l.x = cols - l.w;
    //	l.y++;
    //}
  }
  return l;
}

/**
 * Before moving item down, it will check if the movement will cause collisions and move those items down before.
 */
function resolveCompactionCollision(layout: Layout, item: LayoutItem, moveToCoord: number, axis: 'x' | 'y') {
  item[axis] += 1;
  const itemIndex = layout
    .map((layoutItem) => {
      return layoutItem.i;
    })
    .indexOf(item.i);

  // Go through each item we collide with.
  for (let i = itemIndex + 1; i < layout.length; i++) {
    const otherItem = layout[i];
    // Ignore static items
    if (otherItem.static) {
      continue;
    }

    // Optimization: we can break early if we know we're past this el
    // We can do this b/c it's a sorted layout
    if (otherItem.y > item.y + item.h) {
      break;
    }

    if (collides(item, otherItem)) {
      const axisCoord = axis === 'x' ? item.w : item.h;
      resolveCompactionCollision(layout, otherItem, moveToCoord + axisCoord, axis);
    }
  }

  item[axis] = moveToCoord;
}

/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */
export function compact(
  layout: Layout,
  compactType: CompactType
  //cols: number
): Layout {
  // Statics go in the compareWith array right away so items flow around them.
  const compareWith = getStatics(layout);
  // We go through the items by row and column.
  const sorted = sortLayoutItems(layout);
  // Holding for new items.
  const out = Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = cloneLayoutItem(sorted[i]);

    // Don't move static elements
    if (!l.static) {
      l = compactItem(compareWith, l, compactType, sorted);

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
    }

    // Add to output array to make sure they still come out in the right order.
    out[layout.indexOf(sorted[i])] = l;

    // Clear moved flag, if it exists.
    l.moved = false;
  }

  return out;
}

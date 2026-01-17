import browserPrefix, { browserPrefixToKey } from './getPrefix';

export function createCSSTransform(controlPos: { x: any; y: any }, positionOffset: any): Object {
  const translation = getTranslation(controlPos, positionOffset, 'px');
  return { [browserPrefixToKey('transform', browserPrefix)]: translation };
}

export function getTranslation({ x, y }: any, positionOffset: { x: string; y: string }, unitSuffix: string): string {
  let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`;
  if (positionOffset) {
    const defaultX = `${typeof positionOffset.x === 'string' ? positionOffset.x : positionOffset.x + unitSuffix}`;
    const defaultY = `${typeof positionOffset.y === 'string' ? positionOffset.y : positionOffset.y + unitSuffix}`;
    translation = `translate(${defaultX}, ${defaultY})` + translation;
  }
  return translation;
}

export function ComputeWidthHeigh(element: HTMLElement): { width: number; height: number } {
  const wh = {
    width: 0,
    height: 0,
  };

  if (!element || !element.ownerDocument) {
    return wh;
  }

  const computedStyle = element.ownerDocument.defaultView?.getComputedStyle(element);

  if (computedStyle) {
    let newHeight = element.clientHeight;
    newHeight += parseInt(computedStyle.borderTopWidth, 10);
    newHeight += parseInt(computedStyle.borderBottomWidth, 10);
    wh.height = newHeight;

    let newWidth = element.clientWidth;
    newWidth += parseInt(computedStyle.borderLeftWidth, 10);
    newWidth += parseInt(computedStyle.borderRightWidth, 10);
    wh.width = newWidth;
  }
  return wh;
}

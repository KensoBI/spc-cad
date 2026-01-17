import { toNumber } from 'lodash';

export function resolveCondStyle(leftValue: any, operator: string, rightValue: any): boolean {
  const val = toNumber(rightValue);
  const vtc = toNumber(leftValue);

  if (isFinite(val) && isFinite(vtc)) {
    switch (operator) {
      case '>': {
        if (vtc > val) {
          return true;
        }
        break;
      }
      case '=': {
        if (vtc === val) {
          return true;
        }
        break;
      }
      case '<': {
        if (vtc < val) {
          return true;
        }
        break;
      }
    }
  } else if (operator === '=' && `${leftValue}` === `${rightValue}`) {
    return true;
  }
  return false;
}

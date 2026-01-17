import { isArray, isEqual, isObject, transform } from 'lodash';

export function objectDiff(origObj: any, newObj: any) {
  function changes(newObj: any, origObj: any) {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result: { [key: string | number | symbol]: any }, value, key) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
        result[resultKey] = isObject(value) && isObject(origObj[key]) ? changes(value, origObj[key]) : value;
      }
    });
  }
  return changes(newObj, origObj);
}

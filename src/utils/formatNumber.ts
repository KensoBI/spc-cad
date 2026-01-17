export function formatNumber(num: number) {
  if (num < 0.01) {
    return num.toPrecision(2);
  } else {
    const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
    return rounded % 1 === 0 ? String(rounded.toFixed(0)) : String(rounded.toFixed(2));
  }
}

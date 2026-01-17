import React from 'react';
import { css } from 'emotion';
import { useStyles2 } from '@grafana/ui';
import { COLOR_NEGATIVE_DEVIATION, COLOR_POSITIVE_DEVIATION, COLOR_ZERO_DEVIATION } from 'constants/global';
import { GrafanaTheme2 } from '@grafana/data';
import { formatNumber } from 'utils/formatNumber';

export type GradientLegendProps = {
  range: number;
  currentValue?: number;
};

const STEPS = 7; //-3x, -2x, -x, 0, x, 2x, 3x
const HALF_STEPS = Math.floor(STEPS / 2);

export function GradientLegend({ range, currentValue }: GradientLegendProps) {
  const styles = useStyles2(getStyles);

  const fractionDigits = React.useMemo(() => {
    if (range < 1) {
      return 2;
    }
    if (range < 10) {
      return 1;
    }
    return 0;
  }, [range]);

  const currentValueTop = React.useMemo(() => {
    if (currentValue == null) {
      return null;
    }
    //currentValue >= range -> top = 0
    //currentValue <= -range -> top = 100
    //currentValue = 0 -> top = 50

    let top = 50 - (currentValue / range) * 50;
    top = Math.max(top, 0);
    top = Math.min(top, 100);
    return `${top}%`;
  }, [currentValue, range]);

  return (
    <div className={styles.container}>
      <div className={styles.values}>
        {Array.from({ length: STEPS }).map((_, i) => {
          const value = range * ((i - HALF_STEPS) / HALF_STEPS);
          return <div key={i}>{value.toFixed(fractionDigits)}</div>;
        })}
      </div>
      <div className={styles.gradient} />
      {currentValue != null && currentValueTop != null && (
        <div className={styles.currentValue} style={{ top: currentValueTop }}>
          <span>{formatNumber(currentValue)}</span>
          <span className={styles.currentValueLine}></span>
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    position: absolute;
    right: 20px;
    top: 20px;
    bottom: 20px;
    width: 60px;
    display: flex;
    flex-direction: row;
  `,
  gradient: css`
    background: linear-gradient(
      to top,
      ${COLOR_NEGATIVE_DEVIATION} 0%,
      ${COLOR_ZERO_DEVIATION} 50%,
      ${COLOR_POSITIVE_DEVIATION} 100%
    );
    flex: 1;
    height: 100%;
    border-radius: ${theme.shape.borderRadius(1)};
  `,
  values: css`
    height: 100%;
    flex: 2;
    display: flex;
    flex-direction: column-reverse;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: ${theme.colors.text};
    select: none;
  `,
  currentValue: css`
    position: absolute;
    right: 0;
    width: 150%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
  `,
  currentValueLine: css`
    flex: 1;
    border-top: 1px solid ${theme.colors.text.maxContrast};
  `,
});

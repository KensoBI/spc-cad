import { Color } from 'three';

//Important note: gradientColors() and gradientColorsInShader() should act the same way

export function gradientColors(value: number, maxValue: number) {
  const normalized = Math.max(Math.min(value / maxValue, 1.0), -1.0);

  const color = new Color();

  if (normalized > 0.0) {
    color.r = normalized;
    color.g = 1.0 - normalized;
    color.b = 0.0;
  } else {
    color.r = 0.0;
    color.g = 1.0 + normalized;
    color.b = -normalized;
  }

  return color;
}

export function gradientColorsInShader(
  maxValue: number,
  valueVarName: string,
  normalizedVarName: string,
  colorVarName: string
) {
  return `
        ${normalizedVarName} = ${valueVarName} / ${maxValue.toFixed(2)};

        if(${normalizedVarName} > 1.0) {
          ${normalizedVarName} = 1.0;
        }else if(${normalizedVarName} < -1.0) {
          ${normalizedVarName} = -1.0;
        }

        if(normalized > 0.0) {
            ${colorVarName} = vec3(${normalizedVarName}, 1.0 - ${normalizedVarName}, 0.0);
        }else {
            ${colorVarName} = vec3(0.0, 1.0 + ${normalizedVarName}, -${normalizedVarName});
        }
    `;
}

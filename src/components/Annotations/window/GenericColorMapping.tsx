import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { Button, InlineField, InlineLabel, Input, Select, useStyles2 } from '@grafana/ui';
import React from 'react';
import { css } from 'emotion';
import { InlineColorField } from 'components/InlineColorField';
import { defaultConditionalStyle } from 'constants/defaults';
import { useAvailableColumns } from 'templates/TemplateModelsProvider';
import { sortBy } from 'lodash';
import { ConditionalStyle } from 'types/Annotation';

const cmpOptions: Array<SelectableValue<string>> = [
  {
    value: '<',
    label: '<',
  },
  {
    value: '=',
    label: '=',
  },
  {
    value: '>',
    label: '>',
  },
];
type Props = {
  update: (newStyles: ConditionalStyle[]) => void;
  rows?: ConditionalStyle[];
  constLeftSide?: string;
};

export function GenericColorMapping({ update, rows, constLeftSide }: Props) {
  const styles = useStyles2(getStyles);

  const availableColumns = useAvailableColumns();

  const characteristicOptions = React.useMemo(() => {
    return sortBy(Object.keys(availableColumns)).map((ch) => ({
      value: ch,
      label: ch,
    }));
  }, [availableColumns]);

  const characteristicColumnsOptions = React.useMemo(() => {
    const set = new Set<string>();
    Object.values(availableColumns).forEach((columns) => {
      columns.forEach((column) => set.add(column));
    });
    return sortBy([...set]).map((ch) => ({
      value: ch,
      label: ch,
    }));
  }, [availableColumns]);

  return (
    <div>
      <div>
        {rows?.map((colorParams, index) => (
          <div key={index} className={styles.oneLine}>
            <div className={styles.leftSide}>
              {constLeftSide ? (
                <div className={styles.constLeftSide}>
                  <InlineLabel>{constLeftSide}</InlineLabel>
                </div>
              ) : (
                <>
                  <InlineField label="Control" grow>
                    <Select
                      value={colorParams.control}
                      options={characteristicOptions}
                      placeholder=""
                      onChange={(newValue) => {
                        if (newValue.value != null) {
                          colorParams.control = newValue.value;
                          update(rows);
                        }
                      }}
                      allowCustomValue
                    />
                  </InlineField>
                  <InlineField label="Column" grow>
                    <Select
                      value={colorParams.column}
                      options={characteristicColumnsOptions}
                      placeholder=""
                      onChange={(newValue) => {
                        if (newValue.value != null) {
                          colorParams.column = newValue.value;
                          update(rows);
                        }
                      }}
                      allowCustomValue
                      noOptionsMessage={'Select a Control'}
                    />
                  </InlineField>
                </>
              )}
            </div>
            <div className={styles.cmpContainer}>
              <div>
                <InlineField>
                  <Select
                    value={colorParams.operator}
                    width={8}
                    onChange={(newValue) => {
                      if (newValue.value != null) {
                        colorParams.operator = newValue.value;
                        update(rows);
                      }
                    }}
                    options={cmpOptions}
                  />
                </InlineField>

                <Button
                  fill={colorParams.isStatic ? 'solid' : 'outline'}
                  variant="primary"
                  onClick={() => {
                    const newIsStatic = !colorParams.isStatic;
                    colorParams.isStatic = newIsStatic;
                    update(rows);
                  }}
                  size="sm"
                  className={styles.isStaticButton}
                >
                  Static
                </Button>
              </div>
            </div>

            <div className={styles.rightSide}>
              {colorParams.isStatic === false ? (
                <>
                  <InlineField label="Control" grow>
                    <Select
                      value={colorParams.value.dynamic?.control}
                      options={characteristicOptions}
                      placeholder=""
                      onChange={(newValue) => {
                        if (newValue.value != null) {
                          colorParams.value = {
                            static: colorParams.value.static,
                            dynamic: {
                              control: newValue.value,
                              column: colorParams.value.dynamic?.column ?? '',
                            },
                          };
                          update(rows);
                        }
                      }}
                      allowCustomValue
                    />
                  </InlineField>
                  <InlineField label="Column" grow>
                    <Select
                      value={colorParams.value.dynamic?.column}
                      options={characteristicColumnsOptions}
                      placeholder=""
                      onChange={(newValue) => {
                        if (newValue.value != null) {
                          colorParams.value = {
                            static: colorParams.value.static,
                            dynamic: {
                              control: colorParams.value.dynamic?.control ?? '',
                              column: newValue.value,
                            },
                          };
                          update(rows);
                        }
                      }}
                      allowCustomValue
                      noOptionsMessage={'Select a Control'}
                    />
                  </InlineField>
                </>
              ) : (
                <Input
                  className={styles.staticValueInput}
                  value={colorParams.value.static}
                  onChange={(newValue) => {
                    colorParams.value = {
                      dynamic: colorParams.value?.dynamic,
                      static: newValue.currentTarget.value,
                    };
                    update(rows);
                  }}
                  placeholder="Static value"
                />
              )}
            </div>
            <div>
              <InlineColorField
                color={colorParams.backgroundColor}
                onChange={(newColor) => {
                  colorParams.backgroundColor = newColor;
                  update(rows);
                }}
              />
            </div>

            <Button
              className={styles.rowButton}
              fill="outline"
              variant="destructive"
              icon="trash-alt"
              onClick={() => {
                update(rows?.filter((_, i) => i !== index));
              }}
            />
            <Button
              className={styles.rowButton}
              fill="outline"
              variant="primary"
              icon="arrow-up"
              style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
              onClick={() => {
                const colors = rows ?? [];
                [colors[index], colors[index - 1]] = [colors[index - 1], colors[index]];
                update(colors);
              }}
            />
          </div>
        ))}
      </div>
      <div className={styles.addButtonContainer}>
        <Button
          size="sm"
          fill="outline"
          variant="success"
          icon="plus-circle"
          onClick={() => {
            update([
              ...(rows ?? []),
              {
                ...defaultConditionalStyle,
              },
            ]);
          }}
        >
          Add Color Mapping
        </Button>
      </div>
    </div>
  );
}
const getStyles = (theme: GrafanaTheme2) => {
  return {
    oneLine: css`
      display: flex;
      padding: ${theme.spacing(0.5)};
      background-color: ${theme.colors.secondary.transparent};
      border-radius: ${theme.shape.borderRadius(2)};
      margin-top: ${theme.spacing(0.5)};
    `,
    rowButton: css`
      margin-left: ${theme.spacing(1)};
    `,
    addButtonContainer: css`
      padding: ${theme.spacing(1)};
      display: flex;
      justify-content: center;
    `,
    leftSide: css`
      width: 200px;
    `,
    rightSide: css`
      width: 200px;
    `,
    cmpContainer: css`
      text-align: center;
    `,
    isStaticButton: css`
      padding: ${theme.spacing(0.5)};
      margin-left: auto;
      margin-right: auto;
      transform: translateX(-${theme.spacing(0.25)});
    `,
    staticValueInput: css`
      flex: auto;
      padding-right: ${theme.spacing(0.5)};
    `,
    constLeftSide: css`
      padding-right: ${theme.spacing(0.5)};

      & > label {
        justify-content: center;
      }
    `,
  };
};

import React from 'react';
import { TimeseriesSettings } from 'types/ViewComponentSettings';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import { Button, useStyles2 } from '@grafana/ui';
import { difference } from 'lodash';
import { Popover, usePopoverTrigger } from 'components/popover/Popover';
import { CloseButton } from 'components/popover/CloseButton';
import { PopoverContainer } from 'components/popover/PopoverContainer';
import { MenuItem } from 'components/popover/MenuItem';
import { InlineColorField } from 'components/InlineColorField';

const defaultColor = 'rgb(196, 22, 42)';

type Props = {
  availableFields: string[];
  settings: TimeseriesSettings;
  setSettings: (value: TimeseriesSettings) => void;
};

export function ConstantsList({ availableFields, settings, setSettings }: Props) {
  const styles = useStyles2(getStyles);

  const notSelectedFields = React.useMemo(() => {
    return difference(availableFields, settings.constantsConfig?.map((conf) => conf.name) ?? []);
  }, [availableFields, settings.constantsConfig]);

  const { popoverProps, triggerClick } = usePopoverTrigger();

  const menu = React.useMemo(() => {
    return (
      <PopoverContainer>
        {notSelectedFields.map((fieldName) => (
          <MenuItem
            key={fieldName}
            onClick={() => {
              setSettings({
                ...settings,
                constantsConfig: [
                  ...(settings?.constantsConfig ?? []),
                  {
                    name: fieldName,
                    title: fieldName,
                    color: defaultColor,
                  },
                ],
              });
              popoverProps.onClose();
            }}
          >
            {fieldName}
          </MenuItem>
        ))}
      </PopoverContainer>
    );
  }, [notSelectedFields, popoverProps, setSettings, settings]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h5>Constants: {!settings.constantsConfig?.length ? <i>Empty</i> : <></>}</h5>
          </div>

          <Button
            disabled={notSelectedFields.length === 0}
            onClick={triggerClick}
            icon="plus-circle"
            variant="success"
            fill="text"
            size="sm"
          >
            Add
          </Button>
        </div>

        {settings.constantsConfig?.map((el, index) => (
          <div key={el.name} className={styles.row}>
            <div className={styles.fieldName}>{el.name}</div>
            <div>
              <input
                className={styles.titleInput}
                type="text"
                value={el.title}
                onChange={(e) => {
                  if (settings.constantsConfig) {
                    settings.constantsConfig[index].title = e.target.value;
                  }
                  setSettings({ ...settings });
                }}
              />
            </div>
            <div className={styles.rightColumn}>
              <InlineColorField
                color={el.color}
                onChange={(newColor) => {
                  if (settings.constantsConfig) {
                    settings.constantsConfig[index].color = newColor;
                  }
                  setSettings({ ...settings });
                }}
              />
              <Button
                onClick={() => {
                  setSettings({
                    ...settings,
                    constantsConfig: (settings?.constantsConfig ?? []).filter((conf) => conf.name !== el.name),
                  });
                }}
                icon="trash-alt"
                variant="destructive"
                fill="text"
                aria-label="Remove constant"
              />
            </div>
          </div>
        ))}
        <div className={styles.addButtonContainer}></div>
      </div>
      <Popover {...popoverProps}>
        <CloseButton onClick={() => popoverProps.onClose()} style={{ background: 'black', color: 'white' }} />
        {menu}
      </Popover>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background-color: ${theme.colors.background.canvas};
      padding: ${theme.spacing(1)};
      border-radius: ${theme.shape.borderRadius(2)};
    `,
    header: css`
      display: flex;
    `,
    headerTitle: css`
      flex-grow: 1;
    `,
    titleInput: css`
      background: #0000;
      border-radius: 3px;
      box-shadow: none;
      font-weight: 600;
      padding: 0px 8px;
      resize: none;
      outline: none;
      display: block;
      -webkit-appearance: none;
      height: 100%;

      &:focus {
        background-color: ${theme.colors.background.canvas};
        box-shadow: inset 0 0 0 2px ${theme.colors.primary.border};
      }
    `,
    row: css`
      display: flex;
      gap: ${theme.spacing(0.5)};
      margin-top: ${theme.spacing(0.5)};

      & > div {
        flex: 1;
      }
    `,
    fieldName: css`
      margin-top: auto;
      margin-bottom: auto;
    `,
    rightColumn: css`
      display: flex;
      gap: ${theme.spacing(2)};
    `,
    addButtonContainer: css`
      display: flex;
      justify-content: center;
    `,
  };
};

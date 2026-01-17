import React from 'react';
import { GrafanaTheme2 } from '@grafana/data';
import { css, cx } from 'emotion';
import { TransferableFeature } from 'types/Feature';
import { Badge, Button, IconButton, Tooltip, useStyles2 } from '@grafana/ui';
import { FeatureOverrides } from 'types/CadSettings';
import { Position } from 'types/Position';
import { AnnotationSettings } from 'types/Annotation';
import { assign } from 'lodash';
import { LAYOUT_DEFAULT_WINDOW_SPAN } from 'constants/global';
import { CadPanelOptions } from 'types/CadPanelOptions';
import SceneViewModel from './Scene/SceneViewModel';

type Edited = {
  id: string;
  position?: Position;
};

function startEditing(feature: TransferableFeature): Edited {
  return {
    id: feature.id,
  };
}

type Props = {
  features: TransferableFeature[];
  options: CadPanelOptions;
  onOptionsChange: (options: CadPanelOptions) => void;
  sceneViewModel: SceneViewModel;
};

export function UnpositionedFeatures({ features, options, onOptionsChange, sceneViewModel }: Props) {
  const styles = useStyles2(getStyles);
  const [edited, setEdited] = React.useState<Edited | null>(null);

  const setFeatureOverrides = React.useCallback(
    (key: string, overrides: FeatureOverrides) => {
      onOptionsChange({
        ...options,
        featureOverrides: {
          ...(options.featureOverrides ?? {}),
          [key]: overrides,
        },
      });
    },
    [onOptionsChange, options]
  );

  React.useEffect(() => {
    sceneViewModel.onRaycastAll = (x, y, z) => {
      if (edited == null) {
        return;
      }
      sceneViewModel.showTmpPoint(x, y, z);

      setEdited((prev) => {
        if (prev != null) {
          return {
            ...prev,
            position: {
              x,
              y,
              z,
            },
          };
        }
        return prev;
      });
    };

    return () => {
      sceneViewModel.onRaycastAll = undefined;
    };
  }, [edited, sceneViewModel]);

  const cleanup = React.useCallback(() => {
    setEdited(null);
    sceneViewModel.hideTmpPoint();
  }, [sceneViewModel]);

  const onPinWithNoPosition = React.useCallback(
    (featureId: string) => {
      const anModel: AnnotationSettings = {
        display: 'window',
        uid: featureId,
        gridPos: {
          x: 0,
          y: 0,
          w: LAYOUT_DEFAULT_WINDOW_SPAN,
          h: LAYOUT_DEFAULT_WINDOW_SPAN,
        },
        titleColumn: featureId,
      };

      const anIndex = options.annotations?.findIndex((an) => an.uid === featureId);
      if (options.annotations != null && anIndex != null && anIndex >= 0) {
        options.annotations[anIndex] = assign(options.annotations[anIndex], anModel);
      } else {
        options.annotations = [...(options.annotations ?? []), anModel];
      }

      onOptionsChange({
        ...options,
        featureOverrides: {
          ...(options.featureOverrides ?? {}),
          [featureId]: {
            position: 'none',
          },
        },
        annotations: [...(options.annotations ?? [])],
      });
    },
    [onOptionsChange, options]
  );

  return (
    <div className={styles.container}>
      <h3>Unpositioned Features:</h3>
      <div className={styles.featuresList}>
        {features.map((feature, index) => (
          <Row
            key={index}
            feature={feature}
            isEditing={edited != null && edited.id === feature.id}
            onStartStopEdit={() => {
              if (edited?.id === feature.id) {
                cleanup();
              } else {
                setEdited(startEditing(feature));
              }
            }}
            onSave={() => {
              const position = edited?.position;
              if (position != null) {
                setFeatureOverrides(feature.id, {
                  position,
                });
              }
              cleanup();
            }}
            canSave={edited?.position != null}
            onPinWithNoPosition={() => {
              onPinWithNoPosition(feature.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}

type RowProps = {
  feature: TransferableFeature;
  onSave: () => void;
  onStartStopEdit: () => void;
  isEditing?: boolean;
  canSave?: boolean;
  onPinWithNoPosition: () => void;
};

function Row({ feature, onStartStopEdit, onSave, isEditing, canSave, onPinWithNoPosition }: RowProps) {
  const styles = useStyles2(getStyles);
  return (
    <div
      className={cx({
        [styles.featureContainer]: true,
        [styles.featureEditing]: isEditing,
      })}
    >
      <div className={styles.featureMainRow}>
        <div className={styles.featureParams}>
          {Object.keys(feature.characteristics).map((ch) => (
            <Badge key={ch} color="blue" text={ch} />
          ))}

          <span>{feature.id}</span>

          {!isEditing && (
            <>
              <Tooltip content="Show the feature window with no position">
                <IconButton name="credit-card" aria-label="Show feature window" onClick={onPinWithNoPosition} />
              </Tooltip>

              <Tooltip content="Click on the scene to position the feature.">
                <IconButton name="plus-circle" aria-label="Position feature" onClick={onStartStopEdit} />
              </Tooltip>
            </>
          )}
        </div>

        {isEditing && (
          <div>
            <Button variant="secondary" size="sm" onClick={onStartStopEdit}>
              Cancel
            </Button>
            <Button disabled={!canSave} variant="success" size="sm" onClick={onSave}>
              Save
            </Button>
          </div>
        )}
      </div>

      {isEditing && <div className={styles.tooltip}>Click on the scene to position the feature.</div>}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    margin-top: ${theme.spacing(2)};
    border: 1px solid ${theme.colors.border.weak};
    border-radius: ${theme.shape.borderRadius(2)};
    background: rgba(0, 0, 0, 0.1);
    padding: ${theme.spacing(1)};
    overflow: auto;
    max-height: 100%;

    h3 {
      font-size: ${theme.typography.bodySmall.fontSize};
    }
  `,

  featureContainer: css`
    align-items: center;
    padding: ${theme.spacing(1)};
    border-bottom: 1px solid ${theme.colors.border.weak};
  `,

  featuresList: css`
    display: flex;
    flex-direction: column;
    margin-left: ${theme.spacing(1)};
  `,

  featureParams: css`
    display: flex;
    justify-content: space-between;
    gap: ${theme.spacing(1)};
  `,
  featureEditing: css`
    background: ${theme.colors.background.canvas};
  `,
  featureMainRow: css`
    display: flex;
    justify-content: space-between;
    gap: ${theme.spacing(1)};
  `,
  tooltip: css`
    font-size: ${theme.typography.bodySmall.fontSize};
  `,
});

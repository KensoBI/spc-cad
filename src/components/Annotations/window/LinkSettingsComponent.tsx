import { GrafanaTheme2 } from '@grafana/data';
import { Button, InlineField, Input, Tooltip, useStyles2 } from '@grafana/ui';
import React from 'react';
import { LinkSettings } from 'types/Annotation';
import { css } from 'emotion';

type Props = {
  link: LinkSettings | undefined;
  setLink: (value: LinkSettings | undefined) => void;
};

export function LinkSettingsComponent({ link, setLink }: Props) {
  const styles = useStyles2(getStyles);
  return (
    <div className={styles.row}>
      <InlineField label="Link" grow>
        <Input
          value={link?.url ?? ''}
          placeholder="URL"
          onChange={(e) =>
            setLink(
              e.currentTarget.value !== ''
                ? { url: e.currentTarget.value, openInNewTab: link?.openInNewTab ?? false }
                : undefined
            )
          }
          suffix={
            <Button
              style={{ visibility: link != null ? 'visible' : 'hidden' }}
              onClick={() => setLink(undefined)}
              icon="times"
              variant="secondary"
              size="sm"
              fill="text"
            />
          }
          prefix={
            <Tooltip content={link?.openInNewTab ? 'Open a link in a new Tab' : 'Open link in current Tab'}>
              <Button
                onClick={() => setLink({ url: link?.url ?? '', openInNewTab: !(link?.openInNewTab ?? true) })}
                icon={link?.openInNewTab ? 'external-link-alt' : 'link'}
                variant={link?.openInNewTab ? 'success' : 'primary'}
                size="sm"
                fill="text"
                disabled={link == null}
              />
            </Tooltip>
          }
        />
      </InlineField>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    row: css`
      display: flex;
    `,
  };
};

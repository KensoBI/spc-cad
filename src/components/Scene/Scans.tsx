import React from 'react';
import SceneViewModel from './SceneViewModel';
import { ScanItem } from 'types/CadSettings';
import { HorizontalSlider } from './HorizontalSlider';
import { Button, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from 'emotion';

type Props = {
  sceneViewModel?: SceneViewModel;
  scansTimeline: ScanItem[];
};

export function Scans({ scansTimeline, sceneViewModel }: Props) {
  if (scansTimeline.length === 0 || sceneViewModel == null) {
    return <></>;
  }
  return <ScansSlider sceneViewModel={sceneViewModel} scansTimeline={scansTimeline} />;
}

function ScansSlider({ sceneViewModel, scansTimeline }: Required<Props>) {
  const styles = useStyles2(getStyles);

  const [play, setPlay] = React.useState<boolean>(false);
  const [currentScan, setCurrentScan] = React.useState<number>(0);
  const [loadedScan, setLoadedScan] = React.useState<number | null>(null);

  const timeoutRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    if (play) {
      if (loadedScan !== currentScan) {
        return;
      }

      timeoutRef.current = window.setTimeout(() => {
        if (currentScan < scansTimeline.length - 1) {
          setCurrentScan(currentScan + 1);
        } else {
          setPlay(false);
        }
      }, 1000);
    } else {
      window.clearTimeout(timeoutRef.current);
    }
    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [currentScan, play, scansTimeline.length, loadedScan]);

  React.useEffect(() => {
    if (scansTimeline.length !== 0) {
      setPlay(false);
      setCurrentScan(0);
    }
  }, [scansTimeline.length]);

  React.useEffect(() => {
    if (scansTimeline.length === 0) {
      return;
    }
    if (currentScan >= scansTimeline.length) {
      console.warn('Current scan is out of range.');
      sceneViewModel.disposeCurrentScan();
      return;
    }
    sceneViewModel.loadCurrentScan(scansTimeline[currentScan].link, () => {
      setLoadedScan(currentScan);
    });
  }, [currentScan, scansTimeline, sceneViewModel]);

  React.useEffect(() => {
    return () => {
      sceneViewModel.disposeCurrentScan();
    };
  }, [sceneViewModel]);

  const marks = React.useMemo(() => {
    return scansTimeline.map((el, index) => ({
      value: index,
      label: timeFormatter.format(el.time),
    }));
  }, [scansTimeline]);

  return (
    <div className={styles.container}>
      <div className="sliderContainer">
        <HorizontalSlider
          key={currentScan ?? -1} //because of the bug in the slider I need to change the key to force the slider to recreate after the currentScan is changed
          currentValue={currentScan}
          steps={scansTimeline.length - 1}
          onAfterChange={setCurrentScan}
          marks={marks}
        />
      </div>
      <div className="sliderButtons">
        <Button
          className={styles.playBtn}
          disabled={(!play && loadedScan !== currentScan) || currentScan >= scansTimeline.length - 1}
          onClick={() => setPlay(!play)}
          icon={!play ? 'angle-left' : 'pause'}
        >
          {play ? 'Pause' : 'Play'}
        </Button>
      </div>
    </div>
  );
}

const timeFormatter = Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const getStyles = (theme: GrafanaTheme2) => ({
  container: css`
    position: absolute;
    left: 20px;
    right: 80px;
    bottom: 20px;
    height: 60px;
    display: flex;
    gap: ${theme.spacing(1)};

    .sliderContainer {
      flex: 1;

      input[type='text'] {
        display: none;
      }
    }

    .sliderButtons {
      width: 100px;
      flex: none;
    }
  `,
  playBtn: css``,
});

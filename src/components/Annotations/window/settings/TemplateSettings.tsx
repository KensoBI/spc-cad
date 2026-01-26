import { CloseButton } from 'components/popover/CloseButton';
import { Popover } from 'components/popover/Popover';
import { PopoverContainer } from 'components/popover/PopoverContainer';
import React from 'react';
import { useEditedWindow } from 'templates/TemplateModelsProvider';
import { TemplateModel } from 'types/Annotation';
import { TabsOptions, TemplateSettingsContent } from './TemplateSettingsContent';
import { EditedViewComponentProvider, ViewComponentIds } from './view-settings/EditedViewComponentProvider';

type ContextType = {
  openTemplateSettings: (startingTab?: TabsOptions) => void;
  closeTemplateSettings: () => void;
  templateModel: TemplateModel;
  open: boolean;
};

const Context = React.createContext<ContextType>({} as ContextType);

export function useTemplateSettings() {
  return React.useContext(Context);
}

type Props = {
  templateModel: TemplateModel;
  featureUid: string;
};

const startingTab: TabsOptions = 'feature';

export function TemplateSettingsProvider({ children, templateModel, featureUid }: React.PropsWithChildren<Props>) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [editedWindow, setEditedWindow] = useEditedWindow();

  const [tab, setTab] = React.useState<TabsOptions>(startingTab);
  const [viewComponentsIds, setViewComponentsIds] = React.useState<ViewComponentIds>();

  const open = React.useMemo(() => editedWindow === featureUid, [editedWindow, featureUid]);
  const setOpen = React.useCallback(
    (isOpen: boolean) => {
      setEditedWindow(isOpen ? featureUid : undefined);
    },
    [featureUid, setEditedWindow]
  );

  const onClose = React.useCallback(() => {
    setOpen(false);
    setTab(startingTab);
  }, [setOpen]);

  const contextValue: ContextType = React.useMemo(
    () => ({
      openTemplateSettings: (startingTab?: TabsOptions) => {
        setOpen(true);
        if (startingTab != null) {
          setViewComponentsIds(undefined);
          setTab(startingTab);
        }
      },
      closeTemplateSettings: onClose,
      templateModel,
      open,
    }),
    [onClose, open, setOpen, templateModel]
  );

  React.useEffect(() => {
    const onClick = (selector: string) => (event: any) => {
      const closest = event.target.closest(selector);
      if (closest) {
        onClose();
      }
    };
    const panelHeaderClick = onClick('.panel-header');
    window.addEventListener('click', panelHeaderClick);
    return () => {
      window.removeEventListener('click', panelHeaderClick);
    };
  }, [onClose]);

  return (
    <Context.Provider value={contextValue}>
      <div ref={containerRef}>{children}</div>
      <Popover anchorEl={containerRef.current} open={open} onClose={() => setOpen(false)} clickOutsideEnabled={false}>
        <CloseButton onClick={() => setOpen(false)} />
        <PopoverContainer>
          <EditedViewComponentProvider ids={viewComponentsIds} setIds={setViewComponentsIds}>
            <TemplateSettingsContent tab={tab} setTab={setTab} />
          </EditedViewComponentProvider>
        </PopoverContainer>
      </Popover>
    </Context.Provider>
  );
}

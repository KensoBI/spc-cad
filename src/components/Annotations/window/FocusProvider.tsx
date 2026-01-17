import React from 'react';

type FocusedViewSettersContextType = {
  setFocusedViewItemId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setFocuseViewComponentId: React.Dispatch<React.SetStateAction<string | undefined>>;
};
const FocusedViewSettersContext = React.createContext<FocusedViewSettersContextType>(
  {} as FocusedViewSettersContextType
);

type FocusedViewGettersContextType = {
  focusedViewItemId?: string;
  focusedViewComponentId?: string;
};
const FocusedViewGettersContext = React.createContext<FocusedViewGettersContextType>(
  {} as FocusedViewGettersContextType
);

export function useFocusedViewGetters() {
  return React.useContext(FocusedViewGettersContext);
}

export function useFocusedViewSetters() {
  return React.useContext(FocusedViewSettersContext);
}

export function FocusProvider({ children }: React.PropsWithChildren<{}>) {
  const [focusedViewItemId, setFocusedViewItemId] = React.useState<string | undefined>();
  const [focusedViewComponentId, setFocuseViewComponentId] = React.useState<string | undefined>();

  const focusedGettersValues = React.useMemo(
    () => ({
      focusedViewItemId,
      focusedViewComponentId,
    }),
    [focusedViewComponentId, focusedViewItemId]
  );

  const focusedSettersValues = React.useMemo(
    () => ({
      setFocusedViewItemId,
      setFocuseViewComponentId,
    }),
    []
  );

  return (
    <FocusedViewSettersContext.Provider value={focusedSettersValues}>
      <FocusedViewGettersContext.Provider value={focusedGettersValues}>{children}</FocusedViewGettersContext.Provider>
    </FocusedViewSettersContext.Provider>
  );
}

export function useFocusTriggerProps(
  targetId: string,
  type: 'viewItem' | 'viewComponent'
): {
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
} {
  const { setFocusedViewItemId, setFocuseViewComponentId } = useFocusedViewSetters();

  const setFocusTimeout = React.useRef<NodeJS.Timeout | undefined>();

  const set = React.useMemo(
    () =>
      type === 'viewItem'
        ? setFocusedViewItemId
        : type === 'viewComponent'
        ? setFocuseViewComponentId
        : (undefined as never),
    [setFocuseViewComponentId, setFocusedViewItemId, type]
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      set((prevId) => {
        if (prevId === targetId) {
          setFocusTimeout.current = setTimeout(() => {
            setFocusTimeout.current = undefined;
          }, 500);
        }
        return targetId;
      });
    },
    [set, targetId]
  );

  return {
    onMouseDown,
  };
}

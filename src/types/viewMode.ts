export type ViewMode = 'normal' | 'minimal' | 'grid' | 'list';

export const VIEW_MODES: ViewMode[] = ['normal', 'minimal', 'grid', 'list'];

export const isDisplayMode = (mode: ViewMode): boolean => {
  return mode !== 'normal';
};

export const getNextViewMode = (currentMode: ViewMode): ViewMode => {
  const currentIndex = VIEW_MODES.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % VIEW_MODES.length;
  return VIEW_MODES[nextIndex];
};

export const getViewModeButtonText = (mode: ViewMode): string => {
  return mode === 'normal' ? 'Display' : mode.charAt(0).toUpperCase() + mode.slice(1);
};
export const PET_ATLAS_COLUMNS = 8;
export const PET_ATLAS_ROWS = 9;
export const PET_FRAME_DURATION_MS = 140;
export const PET_EDGE_MARGIN = 12;
export const PET_WIDTHS = {
  desktop: 208,
  mobile: 78,
} as const;

export const PET_ANIMATIONS = {
  idle: { row: 0, frames: 6 },
  "running-right": { row: 1, frames: 8 },
  "running-left": { row: 2, frames: 8 },
  waving: { row: 3, frames: 4 },
  jumping: { row: 4, frames: 5 },
  failed: { row: 5, frames: 8 },
  waiting: { row: 6, frames: 6 },
  running: { row: 7, frames: 6 },
  review: { row: 8, frames: 6 },
} as const;

export type SitePetState = keyof typeof PET_ANIMATIONS;

export function getPetFrame(state: SitePetState, elapsedMs: number): number {
  const frames = PET_ANIMATIONS[state].frames;
  const safeElapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  return Math.floor(safeElapsed / PET_FRAME_DURATION_MS) % frames;
}

export function getPetSpritePosition(
  state: SitePetState,
  frame: number,
): { x: number; y: number } {
  const animation = PET_ANIMATIONS[state];
  const safeFrame = Math.min(
    animation.frames - 1,
    Math.max(0, Math.floor(Number.isFinite(frame) ? frame : 0)),
  );

  return {
    x: (safeFrame / (PET_ATLAS_COLUMNS - 1)) * 100,
    y: (animation.row / (PET_ATLAS_ROWS - 1)) * 100,
  };
}

export function getPetRestingX(
  viewportWidth: number,
  petWidth: number,
  margin = PET_EDGE_MARGIN,
): number {
  const safeMargin = Math.max(0, margin);
  return Math.max(safeMargin, viewportWidth - petWidth - safeMargin);
}

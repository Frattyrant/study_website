export const ANIMATED_TITLE_LABEL = "pawn的知识库";
export const ANIMATED_TITLE_CYCLE_MS = 5000;

export const ANIMATED_TITLE_TOKENS = [
  { text: "p", role: "kicker", delayMs: 0, tilt: -5 },
  { text: "a", role: "kicker", delayMs: 70, tilt: 4 },
  { text: "w", role: "kicker", delayMs: 140, tilt: -3 },
  { text: "n", role: "kicker", delayMs: 210, tilt: 3 },
  { text: "的", role: "connector", delayMs: 280, tilt: -2 },
  { text: "知", role: "receiver", delayMs: 0, tilt: 0 },
  { text: "识", role: "receiver", delayMs: 90, tilt: 0 },
  { text: "库", role: "receiver", delayMs: 180, tilt: 0 },
] as const;

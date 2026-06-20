export const ANIMATED_TITLE_LABEL = "pawn的知识库";
export const ANIMATED_TITLE_CYCLE_MS = 5000;
export const ANIMATED_TITLE_DEFAULT_EFFECT = "pass";
export const ANIMATED_TITLE_EFFECTS = ["pass", "typewriter"] as const;
export type AnimatedTitleEffect = (typeof ANIMATED_TITLE_EFFECTS)[number];

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

export function getRandomTitleEffect(
  random: () => number = Math.random,
): AnimatedTitleEffect {
  const randomValue = random();
  const safeRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : 0;

  return ANIMATED_TITLE_EFFECTS[
    Math.floor(safeRandom * ANIMATED_TITLE_EFFECTS.length)
  ];
}

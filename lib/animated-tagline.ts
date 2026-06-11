export const ANIMATED_TAGLINE_LABEL = "记录学习 IT 的过程";
export const ANIMATED_TAGLINE_CYCLE_MS = 5200;

const TOKEN_DEFINITIONS = [
  { text: "记", tilt: -4 },
  { text: "录", tilt: 3 },
  { text: "学", tilt: -2 },
  { text: "习", tilt: 4 },
  { text: " ", animated: false, tilt: 0 },
  { text: "IT", accent: true, tilt: -1 },
  { text: " ", animated: false, tilt: 0 },
  { text: "的", tilt: 3 },
  { text: "过", tilt: -3 },
  { text: "程", tilt: 2 },
] as const;

let animatedIndex = 0;

export const ANIMATED_TAGLINE_TOKENS = TOKEN_DEFINITIONS.map((token) => {
  const animated = !("animated" in token) || token.animated !== false;
  const delayMs = animated ? animatedIndex * 90 : 0;
  if (animated) animatedIndex += 1;

  return {
    text: token.text,
    animated,
    accent: "accent" in token && token.accent === true,
    delayMs,
    tilt: token.tilt,
  };
});

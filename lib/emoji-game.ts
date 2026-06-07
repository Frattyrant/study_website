export const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "🫠", "😉", "😊", "😇",
  "🥰", "😍", "🤩", "😘", "😗", "☺️", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝",
  "🤑", "🤗", "🤭", "🫢", "🫣", "🤫", "🤔", "🫡", "🤐", "🤨", "😐", "😑", "😶", "🫥",
  "😶‍🌫️", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "🫨", "🙂‍↔️", "🙂‍↕️", "😌", "😔", "😪",
  "🤤", "😴", "🫩", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "😵‍💫",
  "🫪",
  "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐", "😕", "🫤", "😟", "🙁", "☹️", "😮", "😯",
  "😲", "😳", "🥺", "🥹", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣",
  "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩",
  "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀",
  "😿", "😾", "🙈", "🙉", "🙊",
] as const;

export const EMOJI_DECAY_MS = 3_000;

export function getRandomEmojiIndex(
  currentIndex: number,
  random: () => number = Math.random,
): number {
  if (EMOJIS.length <= 1) return 0;

  const safeCurrentIndex =
    Number.isInteger(currentIndex) && currentIndex >= 0 && currentIndex < EMOJIS.length
      ? currentIndex
      : 0;
  const randomValue = random();
  const safeRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : 0;
  const candidate = Math.floor(safeRandom * (EMOJIS.length - 1));

  return candidate >= safeCurrentIndex ? candidate + 1 : candidate;
}

export function getNextEmojiScale(currentScale: number): number {
  const safeScale = Number.isFinite(currentScale)
    ? Math.min(Math.max(currentScale, 1), 3)
    : 1;
  return Math.min(safeScale + 0.1, 3);
}

export function getDecayedEmojiScale(startScale: number, elapsedMs: number): number {
  const safeStartScale = Number.isFinite(startScale)
    ? Math.min(Math.max(startScale, 1), 3)
    : 1;
  const safeElapsedMs = Number.isFinite(elapsedMs)
    ? Math.min(Math.max(elapsedMs, 0), EMOJI_DECAY_MS)
    : 0;
  const progress = safeElapsedMs / EMOJI_DECAY_MS;

  return 1 + (safeStartScale - 1) * (1 - progress);
}

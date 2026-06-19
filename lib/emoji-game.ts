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

export function getNextEmojiScale(_currentScale: number): number {
  void _currentScale;
  return 1;
}

export function getDecayedEmojiScale(_startScale: number, _elapsedMs: number): number {
  void _startScale;
  void _elapsedMs;
  return 1;
}

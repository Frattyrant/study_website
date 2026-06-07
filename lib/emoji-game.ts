export const EMOJIS = ["😀", "😄", "😆", "😂", "😊", "😎", "🤩", "🥳"] as const;

export function getNextEmojiIndex(currentIndex: number): number {
  return (currentIndex + 1) % EMOJIS.length;
}

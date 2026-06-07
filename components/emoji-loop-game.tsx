"use client";

import { useState } from "react";

import { EMOJIS, getNextEmojiIndex } from "@/lib/emoji-game";

export function EmojiLoopGame() {
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  const emoji = EMOJIS[emojiIndex];
  const nextEmoji = EMOJIS[getNextEmojiIndex(emojiIndex)];

  const showNextEmoji = () => {
    setEmojiIndex(getNextEmojiIndex);
    setClickCount((current) => current + 1);
  };

  return (
    <div
      className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-sm"
      aria-label="Emoji 循环小游戏"
    >
      <button
        className="grid size-10 cursor-pointer place-items-center rounded-md bg-surface-strong text-2xl transition hover:scale-105 hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green active:scale-95"
        type="button"
        aria-label={`当前表情 ${emoji}，点击切换到 ${nextEmoji}`}
        onClick={showNextEmoji}
      >
        <span
          key={clickCount}
          className={clickCount > 0 ? "emoji-pop" : undefined}
          aria-hidden="true"
        >
          {emoji}
        </span>
      </button>
      <span className="min-w-16 text-sm text-muted" aria-live="polite">
        点击 <strong className="text-green-dark">{clickCount}</strong> 次
      </span>
    </div>
  );
}

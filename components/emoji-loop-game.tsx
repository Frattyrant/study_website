"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  EMOJIS,
  EMOJI_DECAY_MS,
  getDecayedEmojiScale,
  getNextEmojiScale,
  getRandomEmojiIndex,
} from "@/lib/emoji-game";
import type { EmojiSpawnOrigin } from "@/components/emoji-pile";

interface EmojiLoopGameProps {
  onEmojiSpawn?: (emoji: string, origin: EmojiSpawnOrigin) => void;
}

export function EmojiLoopGame({ onEmojiSpawn }: EmojiLoopGameProps) {
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [emojiPopPeak, setEmojiPopPeak] = useState(1.22);
  const scaleElementRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const currentScaleRef = useRef(1);
  const animationFrameRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);

  const emoji = EMOJIS[emojiIndex];

  const stopScaleReset = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (resetTimeoutRef.current !== null) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  };

  const applyScale = (scale: number) => {
    currentScaleRef.current = scale;
    if (scaleElementRef.current) {
      scaleElementRef.current.style.transform = `scale(${scale})`;
    }
  };

  const startScaleReset = (startScale: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      resetTimeoutRef.current = window.setTimeout(() => {
        applyScale(1);
        resetTimeoutRef.current = null;
      }, EMOJI_DECAY_MS);
      return;
    }

    const startedAt = performance.now();
    const decay = (now: number) => {
      const nextScale = getDecayedEmojiScale(startScale, now - startedAt);
      applyScale(nextScale);

      if (nextScale > 1) {
        animationFrameRef.current = requestAnimationFrame(decay);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(decay);
  };

  const showRandomEmoji = () => {
    stopScaleReset();

    const nextEmojiIndex = getRandomEmojiIndex(emojiIndex);
    const nextEmoji = EMOJIS[nextEmojiIndex];
    const nextScale = getNextEmojiScale(currentScaleRef.current);
    applyScale(nextScale);
    setEmojiPopPeak(Math.min(1.22, 3 / nextScale));
    setEmojiIndex(nextEmojiIndex);
    setClickCount((current) => current + 1);
    startScaleReset(nextScale);

    const buttonBounds = buttonRef.current?.getBoundingClientRect();
    if (buttonBounds) {
      onEmojiSpawn?.(nextEmoji, {
        x: buttonBounds.left + buttonBounds.width / 2,
        y: buttonBounds.top + buttonBounds.height / 2,
      });
    }
  };

  useEffect(() => () => stopScaleReset(), []);

  return (
    <div
      className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 shadow-sm"
      aria-label="Emoji 循环小游戏"
    >
      <button
        ref={buttonRef}
        className="relative z-10 grid size-10 cursor-pointer place-items-center overflow-visible rounded-md bg-surface-strong text-2xl transition hover:scale-105 hover:bg-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green active:scale-95"
        type="button"
        aria-label={`当前表情 ${emoji}，点击随机切换`}
        onClick={showRandomEmoji}
      >
        <span
          ref={scaleElementRef}
          className="emoji-scale"
          aria-hidden="true"
        >
          <span
            key={clickCount}
            className={clickCount > 0 ? "emoji-pop" : undefined}
            style={
              {
                "--emoji-pop-peak": emojiPopPeak,
              } as CSSProperties
            }
          >
            {emoji}
          </span>
        </span>
      </button>
      <span className="min-w-16 text-sm text-muted" aria-live="polite">
        点击 <strong className="text-green-dark">{clickCount}</strong> 次
      </span>
    </div>
  );
}

"use client";

import { useSyncExternalStore, type CSSProperties } from "react";

import footballBall from "@/public/images/football-ball.webp";
import {
  ANIMATED_TITLE_CYCLE_MS,
  ANIMATED_TITLE_DEFAULT_EFFECT,
  type AnimatedTitleEffect,
  ANIMATED_TITLE_LABEL,
  ANIMATED_TITLE_TOKENS,
  getRandomTitleEffect,
} from "@/lib/animated-title";

let selectedTitleEffect: AnimatedTitleEffect = ANIMATED_TITLE_DEFAULT_EFFECT;

function getTitleEffectSnapshot() {
  return selectedTitleEffect;
}

function subscribeToTitleEffect(onStoreChange: () => void) {
  selectedTitleEffect = getRandomTitleEffect();
  queueMicrotask(onStoreChange);
  return () => {};
}

export function AnimatedTitle() {
  const titleEffect = useSyncExternalStore(
    subscribeToTitleEffect,
    getTitleEffectSnapshot,
    () => ANIMATED_TITLE_DEFAULT_EFFECT,
  );

  return (
    <h1
      className={`animated-title animated-title-effect-${titleEffect} text-3xl font-bold drop-shadow-sm sm:text-5xl`}
      aria-label={ANIMATED_TITLE_LABEL}
      data-title-effect={titleEffect}
      style={{ "--title-cycle": `${ANIMATED_TITLE_CYCLE_MS}ms` } as CSSProperties}
    >
      <span className="animated-title-visual" aria-hidden="true">
        {ANIMATED_TITLE_TOKENS.map((token, index) => (
          <span
            className={`animated-title-token animated-title-token-${token.role}`}
            key={`${token.text}-${index}`}
            style={
              {
                "--title-delay": `${token.delayMs}ms`,
                "--title-tilt": `${token.tilt}deg`,
              } as React.CSSProperties
            }
          >
            {token.text}
          </span>
        ))}
        <span
          className="animated-title-ball"
          aria-hidden="true"
          style={
            {
              "--title-ball-image": `url("${footballBall.src}")`,
            } as CSSProperties
          }
        />
      </span>
    </h1>
  );
}

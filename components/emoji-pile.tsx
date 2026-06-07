"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Bodies,
  Body,
  Composite,
  Engine,
  Sleeping,
  type IBodyDefinition,
} from "matter-js";

const EMOJI_SIZE = 36;
const EMOJI_RADIUS = EMOJI_SIZE / 2;
const MAX_EMOJIS = 30;
const EDGE_THICKNESS = 80;
const GROUND_GAP = 8;
const EXIT_DURATION_MS = 180;

export interface EmojiSpawnOrigin {
  x: number;
  y: number;
}

export interface EmojiPileHandle {
  spawn: (emoji: string, origin: EmojiSpawnOrigin) => void;
  clear: () => void;
}

interface PiledEmoji {
  body: Matter.Body;
  element: HTMLSpanElement;
}

function createStaticBoundary(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    friction: 0.8,
    restitution: 0.2,
  });
}

export const EmojiPile = forwardRef<EmojiPileHandle>(function EmojiPile(_, ref) {
  const [mounted, setMounted] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const boundariesRef = useRef<Matter.Body[]>([]);
  const emojisRef = useRef<PiledEmoji[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const previousFrameTimeRef = useRef<number | null>(null);
  const exitTimeoutsRef = useRef<Set<number>>(new Set());
  const reducedMotionRef = useRef(false);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    previousFrameTimeRef.current = null;
  }, []);

  const syncEmojiElements = useCallback(() => {
    for (const item of emojisRef.current) {
      const { angle, position } = item.body;
      item.element.style.transform =
        `translate3d(${position.x - EMOJI_RADIUS}px, ${position.y - EMOJI_RADIUS}px, 0) ` +
        `rotate(${angle}rad)`;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (
      animationFrameRef.current !== null ||
      document.hidden ||
      reducedMotionRef.current
    ) {
      return;
    }

    const frame = (now: number) => {
      const engine = engineRef.current;
      if (!engine) {
        stopAnimation();
        return;
      }

      const previous = previousFrameTimeRef.current ?? now;
      const delta = Math.min(Math.max(now - previous, 8), 32);
      previousFrameTimeRef.current = now;
      Engine.update(engine, delta);
      syncEmojiElements();

      const allSleeping =
        emojisRef.current.length > 0 &&
        emojisRef.current.every((item) => item.body.isSleeping);
      if (allSleeping) {
        stopAnimation();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(frame);
    };

    animationFrameRef.current = requestAnimationFrame(frame);
  }, [stopAnimation, syncEmojiElements]);

  const getSafeAreaBottom = useCallback(() => {
    const layer = layerRef.current;
    if (!layer) return 0;
    return Number.parseFloat(getComputedStyle(layer).paddingBottom) || 0;
  }, []);

  const rebuildBoundaries = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    Composite.remove(engine.world, boundariesRef.current);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const groundY = height - getSafeAreaBottom() - GROUND_GAP;
    const boundaries = [
      createStaticBoundary(
        width / 2,
        groundY + EDGE_THICKNESS / 2,
        width + EDGE_THICKNESS * 2,
        EDGE_THICKNESS,
      ),
      createStaticBoundary(
        -EDGE_THICKNESS / 2,
        height / 2,
        EDGE_THICKNESS,
        height * 2,
      ),
      createStaticBoundary(
        width + EDGE_THICKNESS / 2,
        height / 2,
        EDGE_THICKNESS,
        height * 2,
      ),
    ];
    boundariesRef.current = boundaries;
    Composite.add(engine.world, boundaries);

    for (const item of emojisRef.current) {
      const x = Math.min(Math.max(item.body.position.x, EMOJI_RADIUS), width - EMOJI_RADIUS);
      const y = Math.min(item.body.position.y, groundY - EMOJI_RADIUS);
      Body.setPosition(item.body, { x, y });
      Sleeping.set(item.body, false);
    }
    syncEmojiElements();
    startAnimation();
  }, [getSafeAreaBottom, startAnimation, syncEmojiElements]);

  const removeOldestEmoji = useCallback(() => {
    const engine = engineRef.current;
    const oldest = emojisRef.current.shift();
    if (!engine || !oldest) return;

    Composite.remove(engine.world, oldest.body);
    oldest.element.classList.add("emoji-pile-item-exit");
    const timeout = window.setTimeout(() => {
      oldest.element.remove();
      exitTimeoutsRef.current.delete(timeout);
    }, EXIT_DURATION_MS);
    exitTimeoutsRef.current.add(timeout);
  }, []);

  const clear = useCallback(() => {
    const engine = engineRef.current;
    stopAnimation();

    if (engine) {
      Composite.remove(
        engine.world,
        emojisRef.current.map((item) => item.body),
      );
    }
    for (const item of emojisRef.current) {
      item.element.remove();
    }
    emojisRef.current = [];

    for (const timeout of exitTimeoutsRef.current) {
      window.clearTimeout(timeout);
    }
    exitTimeoutsRef.current.clear();
  }, [stopAnimation]);

  const spawn = useCallback((emoji: string, origin: EmojiSpawnOrigin) => {
    const engine = engineRef.current;
    const layer = layerRef.current;
    if (!engine || !layer || reducedMotionRef.current) return;

    while (emojisRef.current.length >= MAX_EMOJIS) {
      removeOldestEmoji();
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const x = Math.min(Math.max(origin.x, EMOJI_RADIUS), width - EMOJI_RADIUS);
    const y = Math.min(Math.max(origin.y, EMOJI_RADIUS), height - EMOJI_RADIUS);
    const bodyOptions: IBodyDefinition = {
      restitution: 0.42,
      friction: 0.58,
      frictionAir: 0.018,
      density: 0.0015,
      sleepThreshold: 45,
    };
    const body = Bodies.circle(x, y, EMOJI_RADIUS, bodyOptions);
    Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 5,
      y: -(10 + Math.random() * 4),
    });
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.18);

    const element = document.createElement("span");
    element.className = "emoji-pile-item";
    element.textContent = emoji;
    element.style.transform = `translate3d(${x - EMOJI_RADIUS}px, ${y - EMOJI_RADIUS}px, 0)`;
    layer.appendChild(element);

    emojisRef.current.push({ body, element });
    Composite.add(engine.world, body);
    startAnimation();
  }, [removeOldestEmoji, startAnimation]);

  useImperativeHandle(ref, () => ({ spawn, clear }), [clear, spawn]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !layerRef.current) return;

    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = 1;
    engineRef.current = engine;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
      if (mediaQuery.matches) clear();
    };
    const handleVisibility = () => {
      if (document.hidden) stopAnimation();
      else if (emojisRef.current.length > 0) startAnimation();
    };
    const handleResize = () => rebuildBoundaries();

    handleMotionPreference();
    rebuildBoundaries();
    mediaQuery.addEventListener("change", handleMotionPreference);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreference);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
      clear();
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      engineRef.current = null;
      boundariesRef.current = [];
    };
  }, [clear, mounted, rebuildBoundaries, startAnimation, stopAnimation]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={layerRef}
      className="emoji-pile-layer"
      aria-hidden="true"
    />,
    document.body,
  );
});

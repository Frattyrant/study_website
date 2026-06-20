"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";

import petSpritesheet from "@/assets/pets/xianyue/spritesheet.webp";
import {
  clampPetPosition,
  getPetFrame,
  getPetRestingPosition,
  getPetSpritePosition,
  PET_FRAME_DURATION_MS,
  PET_WIDTHS,
  type PetPosition,
  type SitePetState,
} from "@/lib/site-pet";

function isHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

const PET_POSITION_STORAGE_PREFIX = "pawn-site-pet-position-v1";
const CLICK_DRAG_THRESHOLD = 4;

type PetViewportMode = "desktop" | "mobile";

type DragState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

export function SitePet() {
  const pathname = usePathname();
  const petRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef<SitePetState>("idle");
  const stateStartedAtRef = useRef(0);
  const actionUntilRef = useRef(0);
  const animationFrameRef = useRef(0);
  const clickCountRef = useRef(0);
  const positionRef = useRef<PetPosition>({ x: 12, y: 12 });
  const hasCustomPositionRef = useRef(false);
  const dragStateRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const setPetState = useCallback((state: SitePetState, now: number) => {
    if (stateRef.current === state) return;
    stateRef.current = state;
    stateStartedAtRef.current = now;
    petRef.current?.setAttribute("data-state", state);
  }, []);

  const startAction = useCallback(
    (state: "jumping" | "waving", now: number) => {
      setPetState(state, now);
      const frames = state === "jumping" ? 5 : 4;
      actionUntilRef.current = now + frames * PET_FRAME_DURATION_MS;
    },
    [setPetState],
  );

  useEffect(() => {
    const pet = petRef.current;
    if (!pet) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");

    const getMode = (): PetViewportMode =>
      mobile.matches ? "mobile" : "desktop";

    const storageKey = () => `${PET_POSITION_STORAGE_PREFIX}-${getMode()}`;

    const measurePet = () => {
      const rect = pet.getBoundingClientRect();
      const fallbackWidth =
        getMode() === "mobile" ? PET_WIDTHS.mobile : PET_WIDTHS.desktop;
      const fallbackHeight = Math.round((fallbackWidth * 208) / 192);

      return {
        width: rect.width || fallbackWidth,
        height: rect.height || fallbackHeight,
      };
    };

    const applyPosition = (position: PetPosition) => {
      positionRef.current = position;
      pet.style.left = `${position.x}px`;
      pet.style.top = `${position.y}px`;
    };

    const readStoredPosition = (): PetPosition | undefined => {
      try {
        const raw = window.localStorage.getItem(storageKey());
        if (!raw) return undefined;
        const value = JSON.parse(raw) as Partial<PetPosition>;
        if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) {
          return undefined;
        }
        return { x: Number(value.x), y: Number(value.y) };
      } catch {
        return undefined;
      }
    };

    const savePosition = (position: PetPosition) => {
      try {
        window.localStorage.setItem(storageKey(), JSON.stringify(position));
      } catch {
        // Persisting position is nice-to-have; dragging should still work.
      }
    };

    const placeAtRest = () => {
      const size = measurePet();
      const stored = readStoredPosition();
      if (stored) {
        hasCustomPositionRef.current = true;
        const position = clampPetPosition(
          stored,
          window.innerWidth,
          window.innerHeight,
          size.width,
          size.height,
        );
        applyPosition(position);
        savePosition(position);
        return;
      }

      hasCustomPositionRef.current = false;
      applyPosition(
        getPetRestingPosition(
          window.innerWidth,
          window.innerHeight,
          size.width,
          size.height,
          isHomePath(pathname),
        ),
      );
    };

    const showStaticPet = () => {
      setPetState("idle", performance.now());
      const sprite = getPetSpritePosition("idle", 0);
      pet.style.backgroundPosition = `${sprite.x}% ${sprite.y}%`;
      placeAtRest();
    };

    const render = (now: number) => {
      if (reducedMotion.matches) {
        showStaticPet();
        animationFrameRef.current = 0;
        return;
      }

      if (now >= actionUntilRef.current) {
        setPetState("idle", now);
      }

      const frame = getPetFrame(
        stateRef.current,
        now - stateStartedAtRef.current,
      );
      const sprite = getPetSpritePosition(stateRef.current, frame);
      pet.style.backgroundPosition = `${sprite.x}% ${sprite.y}%`;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (animationFrameRef.current || reducedMotion.matches) return;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      const size = measurePet();
      if (hasCustomPositionRef.current) {
        const position = clampPetPosition(
          positionRef.current,
          window.innerWidth,
          window.innerHeight,
          size.width,
          size.height,
        );
        applyPosition(position);
        savePosition(position);
      } else {
        placeAtRest();
      }
      startAnimation();
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      } else {
        startAnimation();
      }
    };

    const handleMotionChange = () => {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      if (reducedMotion.matches) showStaticPet();
      else startAnimation();
    };

    stateStartedAtRef.current = performance.now();
    actionUntilRef.current = 0;
    placeAtRest();
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", handleMotionChange);
    mobile.addEventListener("change", handleResize);

    if (reducedMotion.matches) showStaticPet();
    else startAnimation();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleMotionChange);
      mobile.removeEventListener("change", handleResize);
    };
  }, [pathname, setPetState]);

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nextAction =
      clickCountRef.current % 2 === 0 ? "waving" : "jumping";
    clickCountRef.current += 1;
    startAction(nextAction, performance.now());
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const pet = petRef.current;
    if (!pet) return;

    pet.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: positionRef.current.x,
      startY: positionRef.current.y,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    const pet = petRef.current;
    if (!dragState || !pet || dragState.pointerId !== event.pointerId) return;

    const dx = event.clientX - dragState.startClientX;
    const dy = event.clientY - dragState.startClientY;
    if (
      !dragState.moved &&
      Math.hypot(dx, dy) >= CLICK_DRAG_THRESHOLD
    ) {
      dragState.moved = true;
    }

    if (!dragState.moved) return;

    event.preventDefault();
    const rect = pet.getBoundingClientRect();
    const position = clampPetPosition(
      {
        x: dragState.startX + dx,
        y: dragState.startY + dy,
      },
      window.innerWidth,
      window.innerHeight,
      rect.width,
      rect.height,
    );

    hasCustomPositionRef.current = true;
    positionRef.current = position;
    pet.style.left = `${position.x}px`;
    pet.style.top = `${position.y}px`;
  };

  const finishDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const dragState = dragStateRef.current;
    const pet = petRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    if (!pet) {
      dragStateRef.current = null;
      return;
    }

    if (dragState.moved) {
      suppressClickRef.current = true;
      try {
        window.localStorage.setItem(
          `${PET_POSITION_STORAGE_PREFIX}-${
            window.matchMedia("(max-width: 767px)").matches
              ? "mobile"
              : "desktop"
          }`,
          JSON.stringify(positionRef.current),
        );
      } catch {
        // Ignore storage failures; the current drag position still applies.
      }
    }

    if (pet.hasPointerCapture(event.pointerId)) {
      pet.releasePointerCapture(event.pointerId);
    }
    dragStateRef.current = null;
  };

  return (
    <div className="site-pet-layer" aria-hidden="false">
      <button
        className="site-pet"
        type="button"
        ref={petRef}
        data-state="idle"
        aria-label="和六花互动"
        title="点击六花"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={{ backgroundImage: `url("${petSpritesheet.src}")` }}
      />
    </div>
  );
}

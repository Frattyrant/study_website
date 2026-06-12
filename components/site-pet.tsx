"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import petSpritesheet from "@/assets/pets/xianyue/spritesheet.webp";
import {
  getPetFrame,
  getPetRestingX,
  getPetSpritePosition,
  PET_FRAME_DURATION_MS,
  PET_WIDTHS,
  type SitePetState,
} from "@/lib/site-pet";

function isHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function SitePet() {
  const pathname = usePathname();
  const petRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef<SitePetState>("idle");
  const stateStartedAtRef = useRef(0);
  const actionUntilRef = useRef(0);
  const animationFrameRef = useRef(0);
  const clickCountRef = useRef(0);

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

    const petWidth = () =>
      mobile.matches ? PET_WIDTHS.mobile : PET_WIDTHS.desktop;

    const placeAtRest = () => {
      const x = getPetRestingX(window.innerWidth, petWidth());
      const y = isHomePath(pathname) ? 0 : 14;
      pet.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
      placeAtRest();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const startAnimation = () => {
      if (animationFrameRef.current || reducedMotion.matches) return;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    const handleResize = () => {
      placeAtRest();
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nextAction =
      clickCountRef.current % 2 === 0 ? "waving" : "jumping";
    clickCountRef.current += 1;
    startAction(nextAction, performance.now());
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
        style={{ backgroundImage: `url("${petSpritesheet.src}")` }}
      />
    </div>
  );
}

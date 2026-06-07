"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import rikkaPeek from "@/public/images/rikka-peek-v2.webp";
import {
  getRikkaDirection,
  isPointerInsideHeadEllipse,
  RIKKA_DIRECTION_TRANSFORMS,
  type Point,
  type RikkaDirection,
} from "@/lib/rikka-peek";

const REST_HIDDEN_PERCENT = 24;
const SHY_HIDDEN_PERCENT = 45;
const RECOVERY_DELAY_MS = 400;
const MOBILE_QUERY = "(max-width: 767px)";

interface RikkaPose {
  direction: RikkaDirection;
  shy: boolean;
}

function poseToStyle(pose: RikkaPose) {
  const transform = RIKKA_DIRECTION_TRANSFORMS[pose.direction];
  const hiddenPercent = pose.shy
    ? SHY_HIDDEN_PERCENT
    : REST_HIDDEN_PERCENT;

  return {
    "--rikka-x": `${transform.x}px`,
    "--rikka-y": `${transform.y}px`,
    "--rikka-rotate": `${transform.rotate}deg`,
    "--rikka-hidden": `${hiddenPercent}%`,
  } as React.CSSProperties;
}

export function RikkaPeek({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const targetPoseRef = useRef<RikkaPose>({ direction: "center", shy: false });
  const currentRef = useRef({
    hiddenPercent: REST_HIDDEN_PERCENT,
    rotate: 0,
    x: 0,
    y: 0,
  });
  const animationFrameRef = useRef<number | null>(null);
  const recoveryTimeoutRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const applyPose = useCallback(() => {
    const figure = figureRef.current;
    if (!figure) return;

    if (reducedMotionRef.current) {
      figure.style.setProperty("--rikka-x", "0px");
      figure.style.setProperty("--rikka-y", "0px");
      figure.style.setProperty("--rikka-rotate", "0deg");
      figure.style.setProperty("--rikka-inner-x", "0px");
      figure.style.setProperty("--rikka-inner-y", "0px");
      figure.style.setProperty("--rikka-eye-x", "0px");
      figure.style.setProperty("--rikka-eye-y", "0px");
      figure.style.setProperty(
        "--rikka-hidden",
        `${REST_HIDDEN_PERCENT}%`,
      );
      return true;
    }

    const targetTransform = RIKKA_DIRECTION_TRANSFORMS[targetPoseRef.current.direction];
    const targetHiddenPercent = targetPoseRef.current.shy
      ? SHY_HIDDEN_PERCENT
      : REST_HIDDEN_PERCENT;
    currentRef.current.x += (targetTransform.x - currentRef.current.x) * 0.16;
    currentRef.current.y += (targetTransform.y - currentRef.current.y) * 0.16;
    currentRef.current.rotate += (targetTransform.rotate - currentRef.current.rotate) * 0.16;
    currentRef.current.hiddenPercent += (
      targetHiddenPercent - currentRef.current.hiddenPercent
    ) * 0.18;

    figure.style.setProperty("--rikka-x", `${currentRef.current.x}px`);
    figure.style.setProperty("--rikka-y", `${currentRef.current.y}px`);
    figure.style.setProperty("--rikka-rotate", `${currentRef.current.rotate}deg`);
    figure.style.setProperty(
      "--rikka-inner-x",
      `${currentRef.current.x * 0.12}px`,
    );
    figure.style.setProperty(
      "--rikka-inner-y",
      `${currentRef.current.y * 0.08}px`,
    );
    figure.style.setProperty(
      "--rikka-eye-x",
      `${currentRef.current.x * 0.08}px`,
    );
    figure.style.setProperty(
      "--rikka-eye-y",
      `${currentRef.current.y * 0.06}px`,
    );
    figure.style.setProperty(
      "--rikka-hidden",
      `${currentRef.current.hiddenPercent}%`,
    );

    return (
      Math.abs(targetTransform.x - currentRef.current.x) < 0.05
      && Math.abs(targetTransform.y - currentRef.current.y) < 0.05
      && Math.abs(targetTransform.rotate - currentRef.current.rotate) < 0.02
      && Math.abs(targetHiddenPercent - currentRef.current.hiddenPercent) < 0.05
    );
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (animationFrameRef.current !== null || reducedMotionRef.current) return;

    const frame = () => {
      if (applyPose()) {
        animationFrameRef.current = null;
        return;
      }
      animationFrameRef.current = requestAnimationFrame(frame);
    };
    animationFrameRef.current = requestAnimationFrame(frame);
  }, [applyPose]);

  const clearRecovery = useCallback(() => {
    if (recoveryTimeoutRef.current !== null) {
      window.clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
  }, []);

  const scheduleRecovery = useCallback(() => {
    clearRecovery();
    recoveryTimeoutRef.current = window.setTimeout(() => {
      targetPoseRef.current = {
        ...targetPoseRef.current,
        shy: false,
      };
      recoveryTimeoutRef.current = null;
      startAnimation();
    }, RECOVERY_DELAY_MS);
  }, [clearRecovery, startAnimation]);

  const updateFromPointer = useCallback((point: Point) => {
    const root = rootRef.current;
    if (!root || !visibleRef.current || reducedMotionRef.current) return;

    const rect = root.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height * 0.52,
    };
    const headEllipse = {
      center: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * 0.5,
      },
      radiusX: rect.width * 0.3,
      radiusY: rect.height * 0.26,
    };
    const isShy = isPointerInsideHeadEllipse(point, headEllipse);

    if (isShy) {
      clearRecovery();
      targetPoseRef.current = {
        direction: getRikkaDirection(point, center),
        shy: true,
      };
    } else {
      targetPoseRef.current = {
        direction: getRikkaDirection(point, center),
        shy: targetPoseRef.current.shy,
      };
      if (targetPoseRef.current.shy) scheduleRecovery();
    }
    startAnimation();
  }, [clearRecovery, scheduleRecovery, startAnimation]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) startAnimation();
      else stopAnimation();
    });
    const handleMotion = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (motionQuery.matches) {
        targetPoseRef.current = { direction: "center", shy: false };
        stopAnimation();
        applyPose();
      } else if (visibleRef.current) {
        startAnimation();
      }
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (mobileQuery.matches) return;
      updateFromPointer({ x: event.clientX, y: event.clientY });
    };
    const handlePointerLeave = () => {
      targetPoseRef.current = { direction: "center", shy: false };
      startAnimation();
    };

    observer.observe(root);
    handleMotion();
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    motionQuery.addEventListener("change", handleMotion);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      motionQuery.removeEventListener("change", handleMotion);
      clearRecovery();
      stopAnimation();
    };
  }, [applyPose, clearRecovery, startAnimation, stopAnimation, updateFromPointer]);

  return (
    <div
      ref={rootRef}
      className={`rikka-peek rikka-peek-${variant}${imageLoaded ? " rikka-peek-loaded" : ""}`}
      aria-hidden="true"
    >
      <div
        ref={figureRef}
        className="rikka-peek-figure"
        style={poseToStyle({ direction: "center", shy: false })}
      >
        <div className="rikka-peek-breathe">
          <div className="rikka-peek-parallax">
            <Image
              className="rikka-peek-image"
              src={rikkaPeek}
              alt=""
              priority={false}
              onLoad={() => setImageLoaded(true)}
              sizes={variant === "mobile" ? "78px" : "136px"}
            />
            <span className="rikka-peek-eye-glint rikka-peek-eye-glint-left" />
            <span className="rikka-peek-eye-glint rikka-peek-eye-glint-right" />
          </div>
        </div>
      </div>
    </div>
  );
}

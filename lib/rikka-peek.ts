export type RikkaDirection =
  | "center"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "nw";

export interface Point {
  x: number;
  y: number;
}

export interface Ellipse {
  center: Point;
  radiusX: number;
  radiusY: number;
}

export const RIKKA_DIRECTION_TRANSFORMS: Record<
  RikkaDirection,
  { rotate: number; x: number; y: number }
> = {
  center: { rotate: 0, x: 0, y: 0 },
  n: { rotate: 0, x: 0, y: -12 },
  ne: { rotate: 4, x: 18, y: -10 },
  e: { rotate: 4, x: 18, y: 0 },
  se: { rotate: 3, x: 16, y: 10 },
  s: { rotate: 0, x: 0, y: 12 },
  sw: { rotate: -3, x: -16, y: 10 },
  w: { rotate: -4, x: -18, y: 0 },
  nw: { rotate: -4, x: -18, y: -10 },
};

export function getRikkaDirection(
  pointer: Point,
  center: Point,
  deadZone = 36,
): RikkaDirection {
  const dx = pointer.x - center.x;
  const dy = pointer.y - center.y;
  if (Math.hypot(dx, dy) <= deadZone) return "center";

  const horizontal = dx > deadZone * 0.45 ? "e" : dx < -deadZone * 0.45 ? "w" : "";
  const vertical = dy > deadZone * 0.45 ? "s" : dy < -deadZone * 0.45 ? "n" : "";

  return `${vertical}${horizontal}` as RikkaDirection || "center";
}

export function isPointerInsideHeadEllipse(
  pointer: Point,
  ellipse: Ellipse,
): boolean {
  if (ellipse.radiusX <= 0 || ellipse.radiusY <= 0) return false;

  const normalizedX = (pointer.x - ellipse.center.x) / ellipse.radiusX;
  const normalizedY = (pointer.y - ellipse.center.y) / ellipse.radiusY;
  return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
}

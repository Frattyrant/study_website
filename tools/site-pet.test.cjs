const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("pet atlas maps every animation state to the expected row and frame count", async () => {
  const { PET_ANIMATIONS } = await import("../lib/site-pet.ts");

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(PET_ANIMATIONS).map(([state, animation]) => [
        state,
        [animation.row, animation.frames],
      ]),
    ),
    {
      idle: [0, 6],
      "running-right": [1, 8],
      "running-left": [2, 8],
      waving: [3, 4],
      jumping: [4, 5],
      failed: [5, 8],
      waiting: [6, 6],
      running: [7, 6],
      review: [8, 6],
    },
  );
});

test("pet frames loop and produce valid atlas background positions", async () => {
  const {
    PET_FRAME_DURATION_MS,
    getPetFrame,
    getPetSpritePosition,
  } = await import("../lib/site-pet.ts");

  assert.equal(getPetFrame("idle", 0), 0);
  assert.equal(getPetFrame("idle", PET_FRAME_DURATION_MS), 1);
  assert.equal(getPetFrame("idle", PET_FRAME_DURATION_MS * 6), 0);
  assert.deepEqual(getPetSpritePosition("running-left", 7), {
    x: 100,
    y: 25,
  });
});

test("desktop and mobile pets rest at the viewport bottom-right", async () => {
  const { PET_WIDTHS, getPetRestingX } = await import("../lib/site-pet.ts");

  assert.deepEqual(PET_WIDTHS, { desktop: 208, mobile: 78 });
  assert.equal(getPetRestingX(1280, PET_WIDTHS.desktop), 1060);
  assert.equal(getPetRestingX(390, PET_WIDTHS.mobile), 300);
  assert.equal(getPetRestingX(70, PET_WIDTHS.mobile), 12);
});

test("site pet is mounted globally with accessible and reduced-motion behavior", () => {
  const root = path.resolve(__dirname, "..");
  const layout = fs.readFileSync(path.join(root, "app", "layout.tsx"), "utf8");
  const component = fs.readFileSync(
    path.join(root, "components", "site-pet.tsx"),
    "utf8",
  );
  const styles = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");

  assert.match(layout, /import \{ SitePet \}/);
  assert.match(layout, /<SitePet \/>/);
  assert.match(component, /aria-label="和六花互动"/);
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(component, /PATROL_SPEED|ROUTE_EXIT_SPEED|choosePatrolTarget/);
  assert.match(styles, /\.site-pet-layer/);
  assert.match(styles, /\.site-pet[\s\S]*width: 208px/);
  assert.match(styles, /@media \(max-width: 767px\)[\s\S]*width: 78px/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*\.site-pet/);
});

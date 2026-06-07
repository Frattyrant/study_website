const assert = require("node:assert/strict");
const test = require("node:test");

test("rikka direction resolves center dead zone and eight directions", async () => {
  const { getRikkaDirection } = await import("../lib/rikka-peek.ts");
  const center = { x: 100, y: 100 };

  assert.equal(getRikkaDirection({ x: 100, y: 100 }, center, 20), "center");
  assert.equal(getRikkaDirection({ x: 100, y: 60 }, center, 20), "n");
  assert.equal(getRikkaDirection({ x: 140, y: 60 }, center, 20), "ne");
  assert.equal(getRikkaDirection({ x: 140, y: 100 }, center, 20), "e");
  assert.equal(getRikkaDirection({ x: 140, y: 140 }, center, 20), "se");
  assert.equal(getRikkaDirection({ x: 100, y: 140 }, center, 20), "s");
  assert.equal(getRikkaDirection({ x: 60, y: 140 }, center, 20), "sw");
  assert.equal(getRikkaDirection({ x: 60, y: 100 }, center, 20), "w");
  assert.equal(getRikkaDirection({ x: 60, y: 60 }, center, 20), "nw");
});

test("rikka head ellipse detects touch without transparent-corner false positives", async () => {
  const { isPointerInsideHeadEllipse } = await import("../lib/rikka-peek.ts");
  const ellipse = {
    center: { x: 100, y: 80 },
    radiusX: 30,
    radiusY: 22,
  };

  assert.equal(isPointerInsideHeadEllipse({ x: 100, y: 80 }, ellipse), true);
  assert.equal(isPointerInsideHeadEllipse({ x: 130, y: 80 }, ellipse), true);
  assert.equal(isPointerInsideHeadEllipse({ x: 131, y: 80 }, ellipse), false);
  assert.equal(isPointerInsideHeadEllipse({ x: 70, y: 58 }, ellipse), false);
  assert.equal(isPointerInsideHeadEllipse({ x: 130, y: 102 }, ellipse), false);
});

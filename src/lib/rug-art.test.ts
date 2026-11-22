import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRugFileName, rugFileName, rugPaletteFor, rugPaletteNames, rugSvg, rugSwatch } from "./rug-art";

test("every file name made for a drawing can be read back", () => {
  for (const palette of rugPaletteNames) {
    for (const medallion of [true, false]) {
      for (const view of ["full", "close"] as const) {
        assert.deepEqual(parseRugFileName(rugFileName(palette, medallion, view)), { palette, medallion, view });
      }
    }
  }
});

test("a file name that is not one of ours is refused", () => {
  for (const bad of ["", "ivory.svg", "ivory-medallion-full.png", "../ivory-plain-full.svg", "red-plain-full.svg", "ivory-huge-full.svg"]) {
    assert.equal(parseRugFileName(bad), null, bad);
  }
});

test("the drawing is a complete SVG with the size of its view", () => {
  const full = rugSvg("Sand", true, "full");
  assert.match(full, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 600 840" width="600" height="840">/);
  assert.ok(full.endsWith("</svg>"));
  assert.ok(full.includes("#8d7c63"), "uses the colours of the Sand palette");

  const close = rugSvg("Sand", false, "close");
  assert.match(close, /viewBox="110 230 380 380" width="380" height="380"/);
});

test("the medallion is drawn only when asked for", () => {
  const centre = '<circle cx="300" cy="420" r="9"';
  assert.ok(rugSvg("Ivory", true, "full").includes(centre));
  assert.ok(!rugSvg("Ivory", false, "full").includes(centre));
});

test("an unknown colour falls back to ivory, and the swatch is the field colour", () => {
  assert.equal(rugPaletteFor("Purple"), "Ivory");
  assert.equal(rugPaletteFor("Charcoal"), "Charcoal");
  assert.equal(rugSwatch("Charcoal"), "#3a342e");
});

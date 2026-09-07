const ALLOWED_REGION_BACKGROUNDS = new Set([
  "rgba(0, 0, 0, 0)",
  "rgb(228, 229, 224)",
  "rgb(214, 216, 210)",
  "rgb(245, 244, 238)",
  "rgb(17, 17, 15)",
  "rgb(23, 56, 46)",
  "rgb(16, 39, 31)",
  "rgb(33, 72, 59)",
  "rgb(221, 234, 221)",
  "rgb(217, 75, 48)",
  "rgb(245, 106, 77)",
]);

const ALLOWED_REGION_FONTS = new Set([
  '"Avenir Next", "Segoe UI", system-ui, sans-serif',
  '"Avenir Next Condensed", "Arial Narrow", "Helvetica Neue", sans-serif',
]);

const ALLOWED_REGION_BACKGROUND_IMAGES = new Set([
  "none",
  "linear-gradient(color(srgb 0.623529 0.627451 0.603922 / 0.55) 1px, rgba(0, 0, 0, 0) 1px), linear-gradient(90deg, color(srgb 0.623529 0.627451 0.603922 / 0.55) 1px, rgba(0, 0, 0, 0) 1px)",
  "linear-gradient(color(srgb 0.305882 0.419608 0.376471 / 0.55) 1px, rgba(0, 0, 0, 0) 1px), linear-gradient(90deg, color(srgb 0.305882 0.419608 0.376471 / 0.55) 1px, rgba(0, 0, 0, 0) 1px)",
]);

export function findRegionRuleViolations(regions) {
  return regions.flatMap((region) => {
    const reasons = [];
    if (!ALLOWED_REGION_FONTS.has(region.fontFamily)) reasons.push("font");
    if (!ALLOWED_REGION_BACKGROUNDS.has(region.backgroundColor)) reasons.push("background-color");
    if (region.borderRadius !== "0px") reasons.push("border-radius");
    if (!ALLOWED_REGION_BACKGROUND_IMAGES.has(region.backgroundImage)) reasons.push("background-image");
    return reasons.length ? [{ ...region, reasons }] : [];
  });
}

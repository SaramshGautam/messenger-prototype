// Picks a real photo when one exists, otherwise the SVG placeholder.
//
// Drop generated photos into src/assets/photos/ using the SAME base name as the
// placeholder (e.g. src/assets/photos/planter-deep-wooden.webp replaces
// public/assets/images/planter-deep-wooden.svg). Avatars go in
// src/assets/photos/avatars/<person id>.webp (e.g. susan.webp).
// .webp, .jpg, .jpeg and .png all work. Restart `npm run dev` after adding files.

const files = import.meta.glob("../assets/photos/**/*.{webp,jpg,jpeg,png}", {
  eager: true,
  import: "default",
});

const byName = {};
for (const [path, url] of Object.entries(files)) {
  const rel = path.replace("../assets/photos/", "").replace(/\.(webp|jpe?g|png)$/i, "");
  byName[rel] = url;
}

export const photo = (name) => byName[name] ?? `/assets/images/${name}.svg`;
export const avatar = (personId) => byName[`avatars/${personId}`];
export const hasRealPhoto = (name) => Boolean(byName[name]);

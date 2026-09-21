# Game background artwork

All 14 games have downloaded publisher artwork from PlayStation, Steam or
GOG. Exact source pages and image URLs are recorded in `sources.json`.
These are bundled local files: visitors never request them from the stores.

- **Name:** `<game id>.jpg` (also accepts `.jpeg`, `.png`, `.webp`)
- **Delivery:** WebP, up to 1920 pixels wide, quality 88. Original landscape
  proportions are preserved; the console uses `object-fit: cover`.
- **Rendering:** no blur, saturation filter or artificial zoom. A dark gradient
  keeps the interface readable over the artwork.
- **Credits:** artwork belongs to the respective game publishers. Its presence
  on a public store page does not imply an open-source license.

Run `npm run check:art` to list which games still need one.

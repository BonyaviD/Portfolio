# Wide key art (optional)

Drop a landscape image here named after the game's `id` in `data/hobbies.js`
and it is picked up automatically - no code change. If a game has no file
here, its portrait cover is used instead, so the folder can be filled in one
game at a time.

- **Name:** `<game id>.jpg` (also accepts `.jpeg`, `.png`, `.webp`)
- **Size:** 1920x1080 is ideal; anything 16:9 and >=1280 wide looks right
- **Where these come from:** publisher press kits and official media pages
  publish key art for exactly this use. Check the terms for each title.

Run `npm run check:art` to list which games still need one.

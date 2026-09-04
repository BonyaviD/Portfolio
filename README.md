# Navid Bonyadi — Portfolio

Personal portfolio built with [Nuxt 3](https://nuxt.com).

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run generate`.

## Architecture

```
assets/css/     design tokens + global layers (load order matters)
components/
  base/         reusable primitives (BaseButton, BaseCard, SkillTag, ...)
  effects/      decorative canvas/WebGL wrappers
  layout/       app chrome used once (TheHeader, TheFooter)
  sections/     page sections composed from the above
composables/    imperative rendering logic (WebGL, Three.js) + lifecycle
data/           content and configuration, kept out of the components
layouts/        default app shell
pages/          routes
```

### Design tokens

`assets/css/tokens.css` is the single source of truth for colour, spacing,
typography, radii, shadows, motion and z-index. Components consume **semantic**
tokens (`--color-primary`, `--space-4`) and never the raw palette or literal
values.

The stylesheets are loaded in dependency order — tokens, reset, base,
utilities, scrollbar — as configured in `nuxt.config.ts`.

Breakpoints cannot live in custom properties, so they are fixed by convention
and documented at the top of `tokens.css`:

| name | value  | px   |
| ---- | ------ | ---- |
| sm   | 30rem  | 480  |
| md   | 48rem  | 768  |
| lg   | 60rem  | 960  |
| xl   | 68rem  | 1088 |

### Conventions

- **Naming** — `Base*` for primitives, `The*` for components rendered once per
  app, `*Section` / `*Block` for page composition.
- **Spacing** — a component never sets its own outer margin; the parent owns
  layout via `gap` or the `BaseSection` shell.
- **Content** — copy, links and image lists live in `data/`, not in templates.
- **Effects** — WebGL/Three.js code lives in `composables/`, so components stay
  declarative. Each composable owns its own teardown, pauses when off-screen or
  in a background tab, and is skipped entirely under `prefers-reduced-motion`.
- **Background** — the page has exactly one background: `PageBackdrop` renders a
  fixed, full-viewport aurora behind everything. Sections must stay transparent
  and use the `--glass-*` tokens for any raised surface.
- **Icons** — `components/base/Icon.vue` renders from `data/icons.js`, which is
  generated from the installed `simple-icons` and `lucide` collections. Add the
  name to `ICONS` in `scripts/generate-icons.mjs` and run `npm run icons`; an
  icon that is not in that list renders nothing.
- **Imports** — components are imported explicitly. `nuxt.config.ts` also
  registers the component directories with `pathPrefix: false` so auto-import
  names stay flat.

### Navigation

`TheNavIsland` is a floating capsule that tracks the section under the reading
line and scrolls to it on click. The tracked sections live in `data/site.js` as
`sections`; their ids must match the section elements rendered by the home page.
On viewports under 48rem the island moves to the bottom of the screen as a tab
bar.

### Game artwork

The covers in `assets/img/gaming` are portrait, which is all the card slider
needs. The console shelf wants landscape key art behind it, so it looks for
`assets/img/gaming/wide/<game id>.jpg` and falls back to the portrait cover
when there is none. Dropping a file in is the whole change - Vite resolves the
folder at build time.

`npm run check:art` lists which games are still missing one.

### Photography feed

The prints on the washing line are the photo posts of a public Telegram
channel, read at request time by the server:

```
server/utils/telegram.js       parses the t.me/s/<channel> preview page
server/api/photos.get.js       the manifest, cached 30 min at the edge
server/api/photos/[id].get.js  proxies one image, cached a year
```

**Every byte the page loads is served from this site's own origin.** Iranian
ISPs block Telegram, so the browser must never be handed a `t.me` or
`cdn-telegram.org` URL — that is why the images are proxied rather than linked.
The photo id is the upstream URL, so the proxy holds no state; a host allowlist
is what stops it being used to fetch anything but a Telegram image.

Each post also carries its view count and its reactions, which are written on
the print under the caption.

Configure with `TELEGRAM_CHANNEL` (default `StreetNote`) and
`TELEGRAM_MAX_PHOTOS` (default 20). The channel must be **public and have a
username** — `https://t.me/s/<name>` has to show a list of posts in a browser.

One preview page holds roughly twenty posts but only about half of them are
photos, so a `max` of 20 costs two serial round trips to Telegram. That cost
is paid by one visitor per SWR window, not by everyone: `/` is cached with
`swr` in `nuxt.config.ts`, and the handler wraps the scrape in a cached
function so the in-process call SSR makes does not re-fetch either. Locally
that is a 7.5s cold call against a 27ms warm one.

### Fonts

`assets/fonts` holds the woff2 files and `assets/css/fonts.css` the
`@font-face` rules, both committed. They were generated from Google Fonts
once, by hand.

This replaced `@nuxtjs/google-fonts`, which downloads at build time and fails
soft: one timeout against `fonts.googleapis.com` leaves the build green and
ships a site with no fonts at all. Nothing about the type should depend on the
network at deploy time.

Neither route throws. If the channel is unreachable the manifest comes back
empty and the section falls back to the photos in `data/hobbies.js`.

Note that Telegram is unreachable from Iran, so running this locally always
falls back; the deployed site is where the feed actually works.

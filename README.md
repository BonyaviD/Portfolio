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
  declarative. Each composable owns its own teardown.
- **Imports** — components are imported explicitly. `nuxt.config.ts` also
  registers the component directories with `pathPrefix: false` so auto-import
  names stay flat.

### Known follow-up

`utils/loadThree.js` pulls Three.js from a CDN because the package
is not installed. Run `npm i three` and swap the loader for a real import when
network access allows.

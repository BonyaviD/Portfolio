/**
 * Module hooks that let plain Node import the data/ files, which are written
 * for Vite: `~/` and `@/` aliases, image imports, and `import.meta.glob`.
 *
 * Images become their file name as a string, and a glob becomes an empty
 * object. The tests only read the text in these files, never the assets.
 */
import { pathToFileURL } from "node:url";
import { resolve as resolvePath } from "node:path";

const ROOT = pathToFileURL(resolvePath(import.meta.dirname, "../..") + "/").href;
const ASSET = /\.(avif|gif|jpe?g|png|svg|webp|woff2)(\?.*)?$/;

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("~/") || specifier.startsWith("@/")) {
    specifier = new URL(specifier.slice(2), ROOT).href;
    if (!ASSET.test(specifier) && !/\.[a-z]+$/.test(specifier)) specifier += ".js";
  }
  if (ASSET.test(specifier)) {
    return { url: `data:text/javascript,export default ${JSON.stringify(specifier)};`, shortCircuit: true };
  }
  return next(specifier, context);
}

export async function load(url, context, next) {
  const result = await next(url, context);
  if (!url.startsWith(`${ROOT}data/`) || !result.source) return result;
  const source = String(result.source).replace(/import\.meta\.glob\(/g, "(() => ({}))(");
  return { ...result, source, format: "module" };
}

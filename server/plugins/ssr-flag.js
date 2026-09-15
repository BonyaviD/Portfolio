/**
 * Makes the browser hydrate the server-rendered page instead of rebuilding it.
 *
 * Nuxt 3.13 marks the payload with `"data-ssr": true` and unhead writes a
 * `true` attribute in its boolean form, so the HTML says `data-ssr` with no
 * value. The client entry then checks `dataset.ssr === "true"`, gets an empty
 * string, decides the page was never server-rendered, and mounts the whole app
 * from scratch over the top of it.
 *
 * Nothing logs when that happens, but every visit paid for it: well over a
 * second of main-thread work on a phone while the page was already on screen,
 * and every image re-requested at once, because freshly created <img> elements
 * get their src before their loading="lazy".
 *
 * Only the bare form is rewritten, so a page Nuxt deliberately rendered
 * without SSR - where the attribute is left out - is untouched.
 */
const PAYLOAD_TAG = /<script\b[^>]*\bid="__NUXT_DATA__"[^>]*>/g;
const BARE_FLAG = /\sdata-ssr(?=[\s>])/;

function fixFlag(chunk) {
  return typeof chunk === "string"
    ? chunk.replace(PAYLOAD_TAG, (tag) => tag.replace(BARE_FLAG, ' data-ssr="true"'))
    : chunk;
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    for (const part of ["head", "bodyPrepend", "body", "bodyAppend"]) {
      if (Array.isArray(html[part])) html[part] = html[part].map(fixFlag);
    }
  });
});

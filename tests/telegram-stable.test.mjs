import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchChannelPhotos, resolvePhoto } from '../server/utils/telegram.js';

test('stable post identity resolves a renewed Telegram URL', async () => {
  const originalFetch = globalThis.fetch;
  let filename = 'expired';
  globalThis.fetch = async () => new Response(`<div data-post="StreetNote/123"><a class="tgme_widget_message_photo_wrap" style="background-image:url('https://cdn4.telesco.pe/file/${filename}.jpg')"></a></div>`);
  try {
    const feed = await fetchChannelPhotos('StreetNote', 1);
    assert.equal(feed.photos[0].id, 'post-StreetNote-123-0');
    filename = 'renewed';
    assert.equal(await resolvePhoto(feed.photos[0].id), 'https://cdn4.telesco.pe/file/renewed.jpg');
    await assert.rejects(resolvePhoto('post-StreetNote-999-0'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

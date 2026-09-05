/**
 * Delivers a message from the contact form to Telegram.
 *
 * Telegram rather than email because it is free, needs no third-party form
 * service, and - the deciding reason - the send happens here on the server.
 * The visitor's browser only ever posts to this site's own domain, which is
 * what makes the form work from Iran, where api.telegram.org is blocked.
 *
 * Needs two environment variables:
 *   TELEGRAM_BOT_TOKEN  from @BotFather
 *   TELEGRAM_CHAT_ID    the chat to deliver to
 */

const LIMITS = {
  name: { min: 2, max: 80 },
  contact: { min: 3, max: 120 },
  message: { min: 10, max: 2000 },
};

/** Nobody writes and sends a real message in under three seconds. */
const MIN_FILL_MS = 3000;

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Honeypot: a field no person can see, so anything in it is a bot. Answered
  // with success so the bot has nothing to learn from the response.
  if (clean(body?.website)) return { ok: true };

  const startedAt = Number(body?.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) {
    return { ok: true };
  }

  const fields = {
    name: clean(body?.name),
    contact: clean(body?.contact),
    message: clean(body?.message),
  };

  for (const [field, { min, max }] of Object.entries(LIMITS)) {
    const length = fields[field].length;
    if (length < min || length > max) {
      throw createError({
        statusCode: 422,
        statusMessage: `${field} must be between ${min} and ${max} characters`,
      });
    }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    // Names, never values: this is the first thing anyone looks at when the
    // form answers 503 on a fresh deploy, and guessing which of the two is
    // missing wastes a redeploy each time.
    const missing = [
      !token && "TELEGRAM_BOT_TOKEN",
      !chatId && "TELEGRAM_CHAT_ID",
    ].filter(Boolean);

    console.error(`[contact] not configured - missing ${missing.join(" and ")}`);
    throw createError({
      statusCode: 503,
      statusMessage: `The form is not connected yet (missing ${missing.join(" and ")})`,
    });
  }

  // Sent as plain text with no parse_mode: nothing a visitor types can then
  // be read as markup.
  const text = [
    "New message from the portfolio",
    "",
    `From: ${fields.name}`,
    `Reply to: ${fields.contact}`,
    "",
    fields.message,
  ].join("\n");

  let response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    console.error(`[contact] ${error.message}`);
    throw createError({ statusCode: 502, statusMessage: "Could not reach Telegram" });
  }

  if (!response.ok) {
    // Telegram explains itself in the body; the visitor gets none of it.
    const detail = await response.text().catch(() => "");
    console.error(`[contact] Telegram HTTP ${response.status}: ${detail.slice(0, 300)}`);
    throw createError({ statusCode: 502, statusMessage: "Telegram rejected the message" });
  }

  return { ok: true };
});

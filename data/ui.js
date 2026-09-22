/**
 * Interface text in both languages: labels, buttons, messages, anything that
 * belongs to the site's chrome rather than to a piece of content. Content -
 * projects, games, the About copy - keeps its translations in its own data
 * file, next to the rest of the entry.
 *
 * Every leaf is a `{ en, fa }` pair; `{name}` placeholders are filled by
 * `t(value, vars)` from composables/useLocale.js. tests/i18n.test.mjs fails
 * if either side of a pair is missing or empty.
 */
export const ui = {
  meta: {
    homeTitle: { en: "Home", fa: "خانه" },
    homeOgTitle: { en: "Portfolio of Navid Bonyadi", fa: "پورتفولیوی نوید بنیادی" },
    homeKeywords: {
      en: "Senior Frontend Developer, Next.js, Nuxt, Three.js, Vue, React, Portfolio, Navid Bonyadi, نوید بنیادی",
      fa: "توسعه‌دهنده ارشد فرانت‌اند, برنامه‌نویس فرانت‌اند, Next.js, Nuxt, Three.js, Vue, React, پورتفولیو, نوید بنیادی, Navid Bonyadi",
    },
    aboutTitle: { en: "About", fa: "درباره من" },
    aboutOgTitle: { en: "About Navid Bonyadi", fa: "درباره نوید بنیادی" },
    aboutDescription: {
      en: "More about Navid Bonyadi, a senior frontend developer based in Tehran, specialized in Next.js, Nuxt and Three.js.",
      fa: "درباره نوید بنیادی، توسعه‌دهنده‌ی ارشد فرانت‌اند ساکن تهران و متخصص Next.js، Nuxt و Three.js.",
    },
  },

  layout: {
    skipLink: { en: "Skip to content", fa: "رفتن به محتوا" },
  },

  nav: {
    label: { en: "Sections", fa: "بخش‌ها" },
    home: { en: "{name} - home", fa: "{name} - صفحه‌ی اصلی" },
  },

  language: {
    /** Read aloud for the switch, in the language it switches to. */
    switchTo: { en: "Read this site in English", fa: "این سایت را به فارسی بخوانید" },
  },

  hero: {
    tagline: {
      en: "I build fast, accessible products with Next.js, Nuxt and Three.js — and care about the small motions that make them feel alive.",
      fa: "محصولاتی سریع و دسترس‌پذیر با Next.js، Nuxt و Three.js می‌سازم و به حرکت‌های کوچکی اهمیت می‌دهم که به آن‌ها جان می‌دهند.",
    },
    contact: { en: "Contact me", fa: "تماس با من" },
    cue: { en: "See Magic", fa: "جادو را ببینید" },
    cueLabel: { en: "See Magic — scroll to About", fa: "جادو را ببینید — رفتن به بخش درباره من" },
  },

  sections: {
    about: { en: "About Me", fa: "درباره من" },
    skills: { en: "Skills", fa: "مهارت‌ها" },
    experience: { en: "Experience", fa: "نمونه‌کارها" },
    contact: { en: "Contact Me", fa: "تماس با من" },
    hobbies: { en: "Hobbies", fa: "سرگرمی‌ها" },
  },

  about: {
    badge: {
      en: ["years building", "for the web"],
      fa: ["سال تجربه در", "ساختن برای وب"],
    },
    workWithMe: { en: "Work with me", fa: "همکاری با من" },
    portraitAlt: { en: "Portrait of Navid Bonyadi", fa: "پرتره‌ی نوید بنیادی" },
  },

  aboutPage: {
    story: { en: "The Story So Far", fa: "داستان تا امروز" },
    stack: { en: "Tech Stack", fa: "ابزارهای اصلی" },
    ctaEyebrow: { en: "Open to new projects", fa: "آماده‌ی پروژه‌های تازه" },
    ctaTitle: { en: "Let's build something together", fa: "بیایید با هم چیزی بسازیم" },
    ctaText: {
      en: "A product that needs a fast, polished front end, or an idea that could use some depth? My inbox is always open.",
      fa: "محصولی دارید که به یک فرانت‌اند سریع و دقیق نیاز دارد، یا ایده‌ای که کمی عمق می‌خواهد؟ همیشه برای شنیدنش آماده‌ام.",
    },
    messageMe: { en: "Message me", fa: "پیام بدهید" },
  },

  skills: {
    levels: {
      Beginner: { en: "Beginner", fa: "مبتدی" },
      Intermediate: { en: "Intermediate", fa: "متوسط" },
      Advanced: { en: "Advanced", fa: "پیشرفته" },
      Expert: { en: "Expert", fa: "متخصص" },
    },
  },

  project: {
    shotAlt: { en: "{name} website", fa: "وب‌سایت {name}" },
    newTab: { en: "Opens in a new tab", fa: "در زبانه‌ی جدید باز می‌شود" },
  },

  contact: {
    lede: {
      en: "Working on something, hiring, or just want to talk shop? Send it here and it lands on my phone.",
      fa: "روی پروژه‌ای کار می‌کنید، دنبال نیرو هستید یا فقط می‌خواهید درباره‌ی کار گپ بزنیم؟ پیامتان را همین‌جا بفرستید؛ مستقیم روی گوشی‌ام می‌رسد.",
    },
    replies: { en: "usually replies within a day", fa: "معمولاً ظرف یک روز پاسخ می‌دهم" },
    name: { en: "Name", fa: "نام" },
    reply: { en: "Email or Telegram", fa: "ایمیل یا تلگرام" },
    message: { en: "Message", fa: "پیام" },
    send: { en: "Send message", fa: "ارسال پیام" },
    sending: { en: "Sending", fa: "در حال ارسال" },
    sentTitle: { en: "Message sent", fa: "پیام ارسال شد" },
    sentBody: { en: "Thank you - I will get back to you soon.", fa: "ممنونم؛ به‌زودی جواب می‌دهم." },
    sendAnother: { en: "Send another", fa: "ارسال پیام دیگر" },
    errors: {
      name: { en: "Please give me a name to reply to.", fa: "لطفاً نامی بنویسید که بتوانم با آن جوابتان را بدهم." },
      contact: { en: "Please leave an email or a Telegram handle.", fa: "لطفاً یک ایمیل یا آیدی تلگرام بگذارید." },
      message: { en: "Tell me a little more - ten characters at least.", fa: "کمی بیشتر بنویسید؛ دست‌کم ده کاراکتر." },
      failed: {
        en: "That did not go through. The links beside the form always work.",
        fa: "پیام ارسال نشد. لینک‌های کنار فرم همیشه کار می‌کنند.",
      },
    },
  },

  photography: {
    title: { en: "Photography", fa: "عکاسی" },
    lede: {
      en: "Prints from walks around Iran, pegged up to dry. Drag the line, and point at one to watch it develop.",
      fa: "چاپ‌هایی از پیاده‌روی‌هایم در گوشه و کنار ایران که برای خشک شدن روی طناب آویزان شده‌اند. طناب را بکشید و روی یکی بمانید تا ظاهر شدنش را ببینید.",
    },
    hint: { en: "Drag the line · tap a print", fa: "طناب را بکشید · روی یک عکس بزنید" },
    more: { en: "More photos", fa: "عکس‌های بیشتر" },
    channelAlt: { en: "{title} channel photo", fa: "تصویر کانال {title}" },
    fallbackAlt: { en: "Photo from my Telegram channel", fa: "عکسی از کانال تلگرام من" },
    views: { en: "{count} views", fa: "{count} بازدید" },
    likes: { en: "{count} likes", fa: "{count} پسند" },
    counters: {
      subscribers: { en: "subscribers", fa: "مشترک" },
      photos: { en: "photos", fa: "عکس" },
      videos: { en: "videos", fa: "ویدیو" },
      links: { en: "links", fa: "لینک" },
      files: { en: "files", fa: "فایل" },
    },
  },

  lightbox: {
    photo: { en: "Photo", fa: "عکس" },
    close: { en: "Close", fa: "بستن" },
    previous: { en: "Previous photo", fa: "عکس قبلی" },
    next: { en: "Next photo", fa: "عکس بعدی" },
  },

  gaming: {
    title: { en: "Gaming", fa: "بازی" },
    platform: { en: "Mostly PlayStation", fa: "بیشتر روی پلی‌استیشن" },
    carousel: { en: "Games, console shelf view", fa: "بازی‌ها، نمای قفسه‌ی کنسول" },
    games: { en: "Games", fa: "بازی‌ها" },
    media: { en: "Media", fa: "رسانه" },
    play: { en: "Play", fa: "اجرا" },
    studio: { en: "Studio", fa: "استودیو" },
    inShelf: { en: "In shelf", fa: "در قفسه" },
    series: { en: "Series", fa: "مجموعه" },
    coverAlt: { en: "{title} cover art", fa: "کاور {title}" },
  },

  footer: {
    builtWith: { en: "built with Nuxt", fa: "ساخته‌شده با Nuxt" },
  },
};

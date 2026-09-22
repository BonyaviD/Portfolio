import PipochartImage from "~/assets/img/experience/pipochart.webp";
import ArianSalamatImage from "~/assets/img/experience/ariansalamat.webp";
import SpyImage from "~/assets/img/experience/spy.webp";
import DontSayHiImage from "~/assets/img/experience/dsh.webp";
import AsaRoseImage from "~/assets/img/experience/asarose.webp";

/**
 * Shipped projects: one entry per project, carrying its own write-up, shot and
 * stack. `tech` renders as chips on the card, and the domain in the card's
 * browser bar is derived from `url`, so it can never drift.
 *
 * Names are brands and stay as they are, except the two Persian stores, which
 * go by their Persian names on the Persian site.
 */
export const projects = [
  {
    id: "pipochart",
    name: "Pipochart",
    url: "https://pipochart.com",
    image: PipochartImage,
    tech: ["Next.js", "React"],
    description: {
      en: "Pipochart is an AI trading-analytics platform. It reads a trader's MT5 account read-only, turns their behaviour into four scores and a Survival Gate, and builds a real-time AI coach, a self-writing journal and a broker dashboard on top. I designed and built the site with Next.js.",
      fa: "Pipochart یک پلتفرم تحلیل معاملات مبتنی بر هوش مصنوعی است. حساب MT5 معامله‌گر را به‌صورت فقط‌خواندنی می‌خواند، رفتار معاملاتی او را به چهار امتیاز و یک «Survival Gate» تبدیل می‌کند و روی آن یک مربی هوشمند بلادرنگ، ژورنالی که خودش نوشته می‌شود و داشبوردی برای بروکر می‌سازد. طراحی و توسعه‌ی سایت را با Next.js انجام داده‌ام.",
    },
  },
  {
    id: "arian-salamat",
    name: { en: "Arian Salamat", fa: "آرین سلامت" },
    url: "https://ariansalamat.com",
    image: ArianSalamatImage,
    tech: ["HTML", "CSS"],
    description: {
      en: "Arian Salamat is a Persian online store for health and pharmaceutical products. I designed and implemented the storefront theme using HTML and CSS, while the application itself is powered by a backend developed by another team.",
      fa: "آرین سلامت یک فروشگاه اینترنتی برای محصولات سلامت و دارویی است. قالب فروشگاه را با HTML و CSS طراحی و پیاده‌سازی کردم و بک‌اند آن را تیم دیگری توسعه داده است.",
    },
  },
  {
    id: "spy",
    name: "Spy",
    url: "https://spying.netlify.app/",
    image: SpyImage,
    tech: ["Vue", "Pinia", "Vite"],
    description: {
      en: "Spy is a small multiplayer game without a backend, where the frontend is built using Vue. The project made use of libraries including Pinia and Vite.",
      fa: "Spy یک بازی چندنفره‌ی کوچک و بدون بک‌اند است که فرانت‌اند آن با Vue ساخته شده و از کتابخانه‌هایی مثل Pinia و Vite استفاده می‌کند.",
    },
  },
  {
    id: "dont-say-hi",
    name: "Don't Say Hi",
    url: "https://dontsayhi.com/",
    image: DontSayHiImage,
    tech: ["Vue", "Pinia", "Vite", "Axios"],
    description: {
      en: "This project leverages artificial intelligence for a dating platform, consisting of three subprojects: a landing page built with React, a Python-powered backend, and a Vue-based frontend. I contributed to the frontend development, and the project used libraries such as Axios, Pinia, Vite, and Vue Validate.",
      fa: "یک پلتفرم دوست‌یابی مبتنی بر هوش مصنوعی که از سه زیرپروژه تشکیل شده است: صفحه‌ی فرود با React، بک‌اند با Python و فرانت‌اند با Vue. من در توسعه‌ی فرانت‌اند مشارکت داشتم و در این پروژه از کتابخانه‌هایی مثل Axios، Pinia، Vite و Vue Validate استفاده شد.",
    },
  },
  {
    id: "asa-gallery",
    name: { en: "Asa Gallery", fa: "آسا گالری" },
    url: "https://asarose.com/",
    image: AsaRoseImage,
    tech: ["HTML", "CSS"],
    description: {
      en: "Asa Gallery is a Persian online store for cosmetics and beauty products. I designed and implemented the storefront theme using HTML and CSS, while the application itself is powered by an MVC backend developed by another team.",
      fa: "آسا گالری یک فروشگاه اینترنتی برای لوازم آرایشی و زیبایی است. قالب فروشگاه را با HTML و CSS طراحی و پیاده‌سازی کردم و بک‌اند آن با معماری MVC توسط تیم دیگری توسعه داده شده است.",
    },
  },
];

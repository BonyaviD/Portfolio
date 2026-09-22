import { persianDigits } from "@/utils/i18n";

/** Years of professional front-end work. Shown on the portrait badge. */
export const experienceYears = 6;
const yearsFa = persianDigits(experienceYears);

/** The opening paragraph of the home page About section. */
export const aboutIntro = {
  en: `Senior front-end developer with ${experienceYears}+ years of turning product ideas into fast, accessible web apps. I work across Next.js, Nuxt and Three.js - from the architecture behind a feature to the last detail of its motion.`,
  fa: `توسعه‌دهنده‌ی ارشد فرانت‌اند با بیش از ${yearsFa} سال تجربه در تبدیل ایده‌های محصول به وب‌اپلیکیشن‌های سریع و دسترس‌پذیر. با Next.js، Nuxt و Three.js کار می‌کنم؛ از معماری پشت یک قابلیت تا آخرین جزئیات حرکت آن.`,
};

/** What I bring to a team, as cards on the home page About section. */
export const aboutHighlights = [
  {
    icon: "lucide:layers",
    title: { en: "Architecture that scales", fa: "معماری مقیاس‌پذیر" },
    text: {
      en: "Component systems, state and a rendering strategy - SSR, ISR or static - chosen per page, so the codebase stays easy to grow with the product.",
      fa: "سیستم کامپوننت‌ها، مدیریت state و استراتژی رندر (SSR، ISR یا استاتیک) را برای هر صفحه جداگانه انتخاب می‌کنم تا کدبیس هم‌پای محصول به‌راحتی رشد کند.",
    },
  },
  {
    icon: "lucide:gauge",
    title: { en: "Performance as a feature", fa: "پرفورمنس، به‌عنوان یک قابلیت" },
    text: {
      en: "Core Web Vitals budgets, heavy work loaded only when it is needed, cached server routes and images sized for the screen they land on.",
      fa: "بودجه‌بندی Core Web Vitals، بارگذاری کارهای سنگین فقط در لحظه‌ی نیاز، کش کردن مسیرهای سرور و تصاویری به اندازه‌ی صفحه‌ای که روی آن نمایش داده می‌شوند.",
    },
  },
  {
    icon: "lucide:box",
    title: { en: "Interfaces with depth", fa: "رابط‌هایی با عمق" },
    text: {
      en: "Three.js, WebGL shaders and motion used where they earn their place - never at the cost of accessibility or load time.",
      fa: "Three.js، شیدرهای WebGL و موشن را فقط جایی به کار می‌برم که ارزشش را داشته باشد؛ هرگز به قیمت دسترس‌پذیری یا سرعت بارگذاری.",
    },
  },
  {
    icon: "lucide:users",
    title: { en: "Ownership, end to end", fa: "مسئولیت کامل، از ابتدا تا انتها" },
    text: {
      en: "From Figma to production: API integration, server routes, code review and deployment, and the details that make a product feel finished.",
      fa: "از Figma تا پروداکشن: اتصال به API، مسیرهای سرور، بازبینی کد و دیپلوی، و جزئیاتی که یک محصول را کامل و تمام‌شده نشان می‌دهد.",
    },
  },
];

/** The dedicated About page, told in short chapters. */
export const aboutStory = [
  {
    title: { en: "Where it started", fa: "نقطه‌ی شروع" },
    text: {
      en: "I'm Navid, a self-taught front-end developer who fell in love with the web while customizing tiny HTML pages - and never stopped building since.",
      fa: "من نوید هستم؛ توسعه‌دهنده‌ی فرانت‌اندی که این مسیر را خودآموخته شروع کرد. با شخصی‌سازی صفحه‌های کوچک HTML عاشق وب شدم و از آن روز دست از ساختن نکشیده‌ام.",
    },
  },
  {
    title: { en: `${experienceYears} years in`, fa: `${yearsFa} سال بعد` },
    text: {
      en: "I've gone from storefront themes to building the front end of complete products, shipping production apps in Next.js and Nuxt from the first commit to launch.",
      fa: "از قالب‌های فروشگاهی شروع کردم و امروز فرانت‌اند محصولات کامل را می‌سازم؛ اپلیکیشن‌های پروداکشن با Next.js و Nuxt، از اولین کامیت تا روز انتشار.",
    },
  },
  {
    title: { en: "The toolkit", fa: "جعبه‌ابزار" },
    text: {
      en: "Next.js, Nuxt, React and Vue on TypeScript, with Three.js and WebGL when an interface needs depth - and strong fundamentals in semantic HTML and modern CSS underneath all of it.",
      fa: "Next.js، Nuxt، React و Vue روی TypeScript، و Three.js و WebGL هر جا که رابط کاربری به عمق نیاز دارد؛ و زیر همه‌ی این‌ها، پایه‌ای محکم در HTML معنایی و CSS مدرن.",
    },
  },
  {
    title: { en: "What I care about", fa: "چیزهایی که برایم مهم است" },
    text: {
      en: "The parts people feel but never see: rendering strategy, performance budgets, accessibility and a component architecture a team can build on.",
      fa: "بخش‌هایی که کاربر حسشان می‌کند اما هیچ‌وقت نمی‌بیندشان: استراتژی رندر، بودجه‌ی پرفورمنس، دسترس‌پذیری و معماری کامپوننتی که یک تیم بتواند رویش بسازد.",
    },
  },
  {
    title: { en: "Off the keyboard", fa: "دور از کیبورد" },
    text: {
      en: "Photography walks, story-driven video games and sharing what I learn with the developer community.",
      fa: "پیاده‌روی‌های عکاسی، بازی‌های داستان‌محور و به اشتراک گذاشتن آموخته‌هایم با جامعه‌ی توسعه‌دهندگان.",
    },
  },
];

export const quickFacts = [
  {
    id: "location",
    label: { en: "Based in", fa: "ساکن" },
    value: { en: "Tehran, Iran", fa: "تهران، ایران" },
  },
  {
    id: "experience",
    label: { en: "Experience", fa: "تجربه" },
    value: { en: `${experienceYears}+ Years`, fa: `بیش از ${yearsFa} سال` },
  },
  {
    id: "focus",
    label: { en: "Focus", fa: "تمرکز" },
    value: "Next.js / Nuxt / Three.js",
  },
  {
    id: "languages",
    label: { en: "Languages", fa: "زبان‌ها" },
    value: { en: "FA / EN", fa: "فارسی / انگلیسی" },
  },
];

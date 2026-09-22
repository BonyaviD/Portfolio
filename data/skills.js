/**
 * Skill levels, kept as a closed set so the UI can style them consistently.
 * These are keys; the words shown for them live in data/ui.js.
 */
export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export const skillsIntro = {
  en: "What I build with every day - from the framework a product runs on to the frame budget it has to hit.",
  fa: "ابزارهایی که هر روز با آن‌ها می‌سازم؛ از فریم‌ورکی که محصول روی آن اجرا می‌شود تا بودجه‌ی فریمی که باید به آن برسد.",
};

/** Technology names stay as they are; only the plain-language ones translate. */
const performance = { en: "Performance", fa: "پرفورمنس وب" };

export const skills = [
  { name: "Next.js", level: "Expert", icon: "simple-icons:nextdotjs" },
  { name: "Nuxt", level: "Expert", icon: "simple-icons:nuxtdotjs" },
  { name: "Vue", level: "Expert", icon: "simple-icons:vuedotjs" },
  { name: "React", level: "Advanced", icon: "simple-icons:react" },
  { name: "TypeScript", level: "Advanced", icon: "simple-icons:typescript" },
  { name: "JavaScript", level: "Expert", icon: "simple-icons:javascript" },
  { name: "Three.js", level: "Advanced", icon: "simple-icons:threedotjs" },
  { name: "WebGL / GLSL", level: "Advanced", icon: "simple-icons:webgl" },
  { name: performance, level: "Expert", icon: "lucide:gauge" },
  { name: { en: "HTML & Accessibility", fa: "HTML و دسترس‌پذیری" }, level: "Expert", icon: "simple-icons:html5" },
  { name: "CSS / Sass", level: "Expert", icon: "simple-icons:sass" },
  { name: "Tailwind CSS", level: "Advanced", icon: "simple-icons:tailwindcss" },
  { name: "Pinia", level: "Advanced", icon: "simple-icons:pinia" },
  { name: "Node.js", level: "Advanced", icon: "simple-icons:nodedotjs" },
  { name: { en: "REST APIs", fa: "APIهای REST" }, level: "Expert", icon: "lucide:network" },
  { name: "Vite", level: "Advanced", icon: "simple-icons:vite" },
  { name: "Git & GitHub", level: "Expert", icon: "simple-icons:github" },
  { name: "Vercel", level: "Advanced", icon: "simple-icons:vercel" },
];

/** The shorter, level-annotated list shown on the About page. */
export const coreStack = [
  { name: "Next.js", level: "Expert", icon: "simple-icons:nextdotjs" },
  { name: "Nuxt", level: "Expert", icon: "simple-icons:nuxtdotjs" },
  { name: "React", level: "Advanced", icon: "simple-icons:react" },
  { name: "Vue", level: "Expert", icon: "simple-icons:vuedotjs" },
  { name: "TypeScript", level: "Advanced", icon: "simple-icons:typescript" },
  { name: "Three.js", level: "Advanced", icon: "simple-icons:threedotjs" },
  { name: "Tailwind CSS", level: "Advanced", icon: "simple-icons:tailwindcss" },
  { name: "Node.js", level: "Advanced", icon: "simple-icons:nodedotjs" },
  { name: performance, level: "Expert", icon: "lucide:gauge" },
  { name: "Git & GitHub", level: "Expert", icon: "simple-icons:github" },
];

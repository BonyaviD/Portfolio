/** Years of professional front-end work. Shown on the portrait badge. */
export const experienceYears = 6;

/** The opening paragraph of the home page About section. */
export const aboutIntro = `Senior front-end developer with ${experienceYears}+ years of turning product ideas into fast, accessible web apps. I work across Next.js, Nuxt and Three.js - from the architecture behind a feature to the last detail of its motion.`;

/** What I bring to a team, as cards on the home page About section. */
export const aboutHighlights = [
  {
    icon: "lucide:layers",
    title: "Architecture that scales",
    text: "Component systems, state and a rendering strategy - SSR, ISR or static - chosen per page, so the codebase stays easy to grow with the product.",
  },
  {
    icon: "lucide:gauge",
    title: "Performance as a feature",
    text: "Core Web Vitals budgets, heavy work loaded only when it is needed, cached server routes and images sized for the screen they land on.",
  },
  {
    icon: "lucide:box",
    title: "Interfaces with depth",
    text: "Three.js, WebGL shaders and motion used where they earn their place - never at the cost of accessibility or load time.",
  },
  {
    icon: "lucide:users",
    title: "Ownership, end to end",
    text: "From Figma to production: API integration, server routes, code review and deployment, and the details that make a product feel finished.",
  },
];

/** Longer-form copy for the dedicated About page. */
export const aboutStory = [
  "I'm Navid, a self-taught front-end developer who fell in love with the web while customizing tiny HTML pages - and never stopped building since.",
  `Over the last ${experienceYears} years I've gone from storefront themes to building the front end of complete products, shipping production apps in Next.js and Nuxt from the first commit to launch.`,
  "My toolkit is Next.js, Nuxt, React and Vue on TypeScript, with Three.js and WebGL when an interface needs depth - and strong fundamentals in semantic HTML and modern CSS underneath all of it.",
  "I care about the parts people feel but never see: rendering strategy, performance budgets, accessibility and a component architecture a team can build on.",
  "Beyond coding, I enjoy photography walks, story-driven video games and sharing what I learn with the developer community.",
];

export const quickFacts = [
  { id: "location", label: "Based in", value: "Tehran, Iran" },
  { id: "experience", label: "Experience", value: `${experienceYears}+ Years` },
  { id: "focus", label: "Focus", value: "Next.js / Nuxt / Three.js" },
  { id: "languages", label: "Languages", value: "FA / EN" },
];

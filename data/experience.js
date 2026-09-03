import ArianSalamatImage from "~/assets/img/experience/ariansalamat.png";
import SpyImage from "~/assets/img/experience/spy.png";
import DontSayHiImage from "~/assets/img/experience/dsh.png";
import AsaRoseImage from "~/assets/img/experience/asarose.png";

/**
 * Shipped projects: one entry per project, carrying its own write-up, shot and
 * stack. `tech` renders as chips on the card, and the domain in the card's
 * browser bar is derived from `url`, so it can never drift.
 */
export const projects = [
  {
    id: "arian-salamat",
    name: "Arian Salamat",
    url: "https://ariansalamat.com",
    image: ArianSalamatImage,
    tech: ["HTML", "CSS"],
    description:
      "Arian Salamat is a Persian online store for health and pharmaceutical products. I designed and implemented the storefront theme using HTML and CSS, while the application itself is powered by a backend developed by another team.",
  },
  {
    id: "spy",
    name: "Spy",
    url: "https://spying.netlify.app/",
    image: SpyImage,
    tech: ["Vue", "Pinia", "Vite"],
    description:
      "Spy is a small multiplayer game without a backend, where the frontend is built using Vue. The project made use of libraries including Pinia and Vite.",
  },
  {
    id: "dont-say-hi",
    name: "Don't Say Hi",
    url: "https://dontsayhi.com/",
    image: DontSayHiImage,
    tech: ["Vue", "Pinia", "Vite", "Axios"],
    description:
      "This project leverages artificial intelligence for a dating platform, consisting of three subprojects: a landing page built with React, a Python-powered backend, and a Vue-based frontend. I contributed to the frontend development, and the project used libraries such as Axios, Pinia, Vite, and Vue Validate.",
  },
  {
    id: "asa-gallery",
    name: "Asa Gallery",
    url: "https://asarose.com/",
    image: AsaRoseImage,
    tech: ["HTML", "CSS"],
    description:
      "Asa Gallery is a Persian online store for cosmetics and beauty products. I designed and implemented the storefront theme using HTML and CSS, while the application itself is powered by an MVC backend developed by another team.",
  },
];

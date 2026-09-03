import ArianSalamatImage from "~/assets/img/experience/ariansalamat.png";
import SpyImage from "~/assets/img/experience/spy.png";
import DontSayHiImage from "~/assets/img/experience/dsh.png";
import AsaRoseImage from "~/assets/img/experience/asarose.png";

/** Narrative write-ups shown above the project cards. */
export const experiences = [
  {
    id: "shop",
    title: "Shop",
    description:
      "This is an online shop practice project where I developed the frontend, while the backend is powered by a fake or test API. The project utilized libraries and tools such as Axios, Pinia, Vite, and Vuetify.",
  },
  {
    id: "spy",
    title: "Spy",
    description:
      "Spy is a small multiplayer game without a backend, where the frontend is built using Vue. The project made use of libraries including Pinia and Vite.",
  },
  {
    id: "dont-say-hi",
    title: "Don't Say Hi",
    description:
      "This project leverages artificial intelligence for a dating platform, consisting of three subprojects: a landing page built with React, a Python-powered backend, and a Vue-based frontend. I contributed to the frontend development, and the project used libraries such as Axios, Pinia, Vite, and Vue Validate.",
  },
  {
    id: "asa-gallery",
    title: "Asa Gallery",
    description:
      "Asa Gallery is a Persian online store for cosmetics and beauty products. I designed and implemented the storefront theme using HTML and CSS, while the application itself is powered by an MVC backend developed by another team.",
  },
];

/**
 * Shipped projects. `surface` names the plate colour the screenshot sits on
 * (each site has its own brand background); `zoomOrigin` tunes the hover
 * zoom so the interesting part of the screenshot stays in frame.
 */
export const projects = [
  {
    id: "arian-salamat",
    name: "Arian Salamat",
    url: "https://ariansalamat.com",
    image: ArianSalamatImage,
    stack: "This project was developed using HTML and CSS",
    surface: "light",
    zoomOrigin: "top",
  },
  {
    id: "spy",
    name: "Spy",
    url: "https://spying.netlify.app/",
    image: SpyImage,
    stack: "This project was developed using Vue.js",
    surface: "ink",
    zoomOrigin: "top",
  },
  {
    id: "dont-say-hi",
    name: "Don't Say hi",
    url: "https://dontsayhi.com/",
    image: DontSayHiImage,
    stack: "This project was developed using Vue.js",
    surface: "violet",
    zoomOrigin: "center",
  },
  {
    id: "asa-gallery",
    name: "Asa Gallery",
    url: "https://asarose.com/",
    image: AsaRoseImage,
    stack: "This project theme was developed using HTML and CSS",
    surface: "light",
    zoomOrigin: "top",
  },
];

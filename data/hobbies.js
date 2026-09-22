import TehranPeople from "~/assets/img/photography/tehran-people.webp";
import Flower from "~/assets/img/photography/flower.webp";
import Street from "~/assets/img/photography/street.webp";
import MiladTower from "~/assets/img/photography/tehran-milad.webp";
import AstaraSnow from "~/assets/img/photography/astara-snow.webp";
import Airplane from "~/assets/img/photography/airplane.webp";
import Hormuz from "~/assets/img/photography/hormoz.webp";

import TheLastOfUs from "~/assets/img/gaming/the-last-of-us.webp";
import PrinceOfPersia from "~/assets/img/gaming/prince-of-persia.webp";
import BeyondTwoSouls from "~/assets/img/gaming/beyond-two-souls.webp";
import Kena from "~/assets/img/gaming/kena.webp";
import Hellblade from "~/assets/img/gaming/hellblade.webp";
import Detroit from "~/assets/img/gaming/detroit.webp";
import Plague from "~/assets/img/gaming/plague.webp";
import Control from "~/assets/img/gaming/control.webp";
import FinalFantasy from "~/assets/img/gaming/final-fantasy.webp";
import Cyberpunk from "~/assets/img/gaming/cyberpunk.webp";
import GhostOfTsushima from "~/assets/img/gaming/ghost-of-tsushima.webp";
import ItTakesTwo from "~/assets/img/gaming/it-takes-two.webp";
import NierAutomata from "~/assets/img/gaming/nier-automata.webp";
import ResidentEvil from "~/assets/img/gaming/resident-evil.webp";

/**
 * Photography mosaic. `id` doubles as the CSS class that places the tile on
 * the section's grid, so ids must stay in sync with PhotographyBlock styles.
 */
export const photos = [
  {
    id: "tehran-people",
    src: TehranPeople,
    alt: { en: "People walking at night in Tehran", fa: "مردمی که شب در تهران قدم می‌زنند" },
    title: { en: "People", fa: "مردم" },
    place: { en: "Tehran", fa: "تهران" },
  },
  {
    id: "flower",
    src: Flower,
    alt: { en: "Flower close-up", fa: "نمای نزدیک یک گل" },
    title: { en: "Flower", fa: "گل" },
    place: { en: "Astara", fa: "آستارا" },
  },
  {
    id: "street",
    src: Street,
    alt: { en: "Street photography scene", fa: "صحنه‌ای از عکاسی خیابانی" },
    title: { en: "Street", fa: "خیابان" },
    place: { en: "Astara", fa: "آستارا" },
  },
  {
    id: "milad-tower",
    src: MiladTower,
    alt: { en: "Milad Tower", fa: "برج میلاد" },
    title: { en: "Tower", fa: "برج" },
    place: { en: "Tehran", fa: "تهران" },
  },
  {
    id: "airplane",
    src: Airplane,
    alt: { en: "Airplane in the sky", fa: "هواپیما در آسمان" },
    title: { en: "Airplane", fa: "هواپیما" },
    place: { en: "Tehran", fa: "تهران" },
  },
  {
    id: "astara-snow",
    src: AstaraSnow,
    alt: { en: "Snowy landscape in Astara", fa: "منظره‌ی برفی آستارا" },
    title: { en: "Snow", fa: "برف" },
    place: { en: "Astara", fa: "آستارا" },
  },
  {
    id: "hormuz",
    src: Hormuz,
    alt: { en: "Mountain in Hormuz island", fa: "کوهی در جزیره‌ی هرمز" },
    title: { en: "Mountain", fa: "کوه" },
    place: { en: "Hormuz", fa: "هرمز" },
  },
];

/** The hero background is the same shot as the first photography tile. */
export const heroPhoto = photos[0];

/**
 * Optional landscape key art, keyed by game id.
 *
 * Vite resolves this at build time, so dropping `the-last-of-us.jpg` into
 * assets/img/gaming/wide/ is all it takes for that game to start using it.
 * Anything without a file here falls back to its portrait cover.
 */
const wideArt = Object.fromEntries(
  Object.entries(
    import.meta.glob("../assets/img/gaming/wide/*.{jpg,jpeg,png,webp}", {
      eager: true,
      import: "default",
    })
  ).map(([path, url]) => [path.split("/").pop().replace(/\.[^.]+$/, ""), url])
);

/** Genre names, shared by the games below. */
const genre = {
  "Action-adventure": { en: "Action-adventure", fa: "اکشن-ماجرایی" },
  "Interactive drama": { en: "Interactive drama", fa: "درام تعاملی" },
  "Stealth adventure": { en: "Stealth adventure", fa: "ماجرایی مخفی‌کاری" },
  "Role-playing": { en: "Role-playing", fa: "نقش‌آفرینی" },
  "Action RPG": { en: "Action RPG", fa: "نقش‌آفرینی اکشن" },
  "Co-op platformer": { en: "Co-op platformer", fa: "پلتفرمر دونفره" },
  "Survival horror": { en: "Survival horror", fa: "وحشت بقا" },
};

/**
 * Favourite games. `studio`, `year` and `genre` are public facts about each
 * title; `blurb` describes the game, not my opinion of it. Titles and studios
 * are proper names and stay in English in both languages. The slide's accent
 * colour is sampled from the cover by `npm run accents`, so it is never
 * hand-guessed.
 */
export const games = [
  {
    id: "the-last-of-us",
    src: TheLastOfUs,
    title: "The Last of Us",
    studio: "Naughty Dog",
    year: 2013,
    genre: genre["Action-adventure"],
    blurb: {
      en: "A smuggler escorts a teenage girl across a collapsed United States. Its reputation rests on the writing and performances rather than the shooting.",
      fa: "یک قاچاقچی، دختری نوجوان را از میان ایالات متحده‌ای فروپاشیده عبور می‌دهد. شهرتش را مدیون نویسندگی و بازی بازیگرانش است، نه تیراندازی.",
    },
  },
  {
    id: "prince-of-persia",
    src: PrinceOfPersia,
    title: "Prince of Persia: Warrior Within",
    studio: "Ubisoft",
    year: 2004,
    genre: genre["Action-adventure"],
    blurb: {
      en: "The darker turn in the Sands of Time trilogy, built on acrobatic traversal, time manipulation and a hostile island fortress.",
      fa: "تاریک‌ترین قسمت سه‌گانه‌ی شن‌های زمان؛ با حرکات آکروباتیک، کنترل زمان و قلعه‌ای خصمانه در دل یک جزیره.",
    },
  },
  {
    id: "beyond-two-souls",
    src: BeyondTwoSouls,
    title: "Beyond: Two Souls",
    studio: "Quantic Dream",
    year: 2013,
    genre: genre["Interactive drama"],
    blurb: {
      en: "Jodie's life told out of order, bound to an invisible entity. Choices steer the story more than any combat system does.",
      fa: "زندگی جودی بدون ترتیب زمانی روایت می‌شود؛ زندگی‌ای گره‌خورده با موجودی نامرئی. انتخاب‌ها بیش از هر سیستم مبارزه‌ای داستان را پیش می‌برند.",
    },
  },
  {
    id: "kena",
    src: Kena,
    title: "Kena: Bridge of Spirits",
    studio: "Ember Lab",
    year: 2021,
    genre: genre["Action-adventure"],
    blurb: {
      en: "A spirit guide clears a corrupted forest, in a world animated to the standard of a feature film.",
      fa: "راهنمای ارواح، جنگلی آلوده را پاک‌سازی می‌کند؛ در جهانی که هم‌تراز یک انیمیشن سینمایی جان گرفته است.",
    },
  },
  {
    id: "hellblade",
    src: Hellblade,
    title: "Hellblade: Senua's Sacrifice",
    studio: "Ninja Theory",
    year: 2017,
    genre: genre["Action-adventure"],
    blurb: {
      en: "A Pict warrior's journey into Norse myth, told through binaural audio that puts Senua's psychosis inside your headphones.",
      fa: "سفر یک جنگجوی پیکت به دل اسطوره‌های نورس، با صدای باینورالی که روان‌پریشی سنوا را درست داخل هدفونتان می‌آورد.",
    },
  },
  {
    id: "detroit",
    src: Detroit,
    title: "Detroit: Become Human",
    studio: "Quantic Dream",
    year: 2018,
    genre: genre["Interactive drama"],
    blurb: {
      en: "Three androids in a near-future Detroit, across a branching story that visibly maps every path you did not take.",
      fa: "سه اندروید در دیترویتِ آینده‌ی نزدیک، در داستانی شاخه‌ای که همه‌ی مسیرهایی را که انتخاب نکرده‌اید جلوی چشمتان می‌گذارد.",
    },
  },
  {
    id: "plague",
    src: Plague,
    title: "A Plague Tale: Innocence",
    studio: "Asobo Studio",
    year: 2019,
    genre: genre["Stealth adventure"],
    blurb: {
      en: "Two siblings cross plague-era France, where light is the only thing holding back the rats.",
      fa: "خواهر و برادری از فرانسه‌ی دوران طاعون می‌گذرند؛ جایی که تنها نور، موش‌ها را عقب نگه می‌دارد.",
    },
  },
  {
    id: "control",
    src: Control,
    title: "Control",
    studio: "Remedy Entertainment",
    year: 2019,
    genre: genre["Action-adventure"],
    blurb: {
      en: "A federal bureau housed in a building that rearranges itself. Brutalist concrete, telekinesis, and paperwork about the impossible.",
      fa: "اداره‌ای فدرال در ساختمانی که مدام خودش را بازچینی می‌کند. بتن بروتالیستی، تله‌کینزی و پرونده‌هایی درباره‌ی ناممکن‌ها.",
    },
  },
  {
    id: "final-fantasy",
    src: FinalFantasy,
    title: "Final Fantasy VII Remake",
    studio: "Square Enix",
    year: 2020,
    genre: genre["Role-playing"],
    blurb: {
      en: "Cloud joins Avalanche in Midgar, where a fight against Shinra grows into something far larger. A reimagining of the original game's opening chapter.",
      fa: "کلاد در میدگار به گروه اَوَلانچ می‌پیوندد و نبرد با شین‌را به چیزی بسیار بزرگ‌تر تبدیل می‌شود. بازآفرینی فصل آغازین بازی اصلی.",
    },
  },
  {
    id: "cyberpunk",
    src: Cyberpunk,
    title: "Cyberpunk 2077",
    studio: "CD Projekt Red",
    year: 2020,
    genre: genre["Action RPG"],
    blurb: {
      en: "Night City, rebuilt over years of patches into the dense open world it was pitched as.",
      fa: "نایت‌سیتی؛ که طی سال‌ها آپدیت، همان جهان باز پرجزئیاتی شد که از ابتدا وعده‌اش را داده بودند.",
    },
  },
  {
    id: "it-takes-two",
    src: ItTakesTwo,
    title: "It Takes Two",
    studio: "Hazelight Studios",
    year: 2021,
    genre: genre["Co-op platformer"],
    blurb: {
      en: "Split-screen only, two players required, and a new mechanic in almost every chapter.",
      fa: "فقط صفحه‌ی دونفره، حتماً با دو بازیکن، و تقریباً در هر فصل یک مکانیک تازه.",
    },
  },
  {
    id: "nier-automata",
    src: NierAutomata,
    title: "NieR: Automata",
    studio: "PlatinumGames",
    year: 2017,
    genre: genre["Action RPG"],
    blurb: {
      en: "Androids fight machines in a ruined world, across multiple playthroughs that each reframe what the last one meant.",
      fa: "اندرویدها در جهانی ویران با ماشین‌ها می‌جنگند؛ در چند دور بازی که هر کدام معنای دور قبلی را از نو تعریف می‌کند.",
    },
  },
  {
    id: "resident-evil",
    src: ResidentEvil,
    title: "Resident Evil Village",
    studio: "Capcom",
    year: 2021,
    genre: genre["Survival horror"],
    blurb: {
      en: "First-person horror through a snowbound village and its castle, leaning further into action than the entry before it.",
      fa: "وحشت اول‌شخص در دهکده‌ای برف‌گرفته و قلعه‌ی آن؛ با گرایشی بیشتر به اکشن نسبت به قسمت قبلی.",
    },
  },
  {
    id: "ghost-of-tsushima",
    src: GhostOfTsushima,
    title: "Ghost of Tsushima",
    studio: "Sucker Punch",
    year: 2020,
    genre: genre["Action-adventure"],
    blurb: {
      en: "A samurai abandons his code to fight the Mongol invasion, on an island built to be looked at.",
      fa: "سامورایی‌ای که برای مقابله با یورش مغول‌ها آیینش را کنار می‌گذارد؛ در جزیره‌ای که برای تماشا ساخته شده است.",
    },
  },
];

/**
 * Games with their key art resolved. `wide` is the landscape image where one
 * exists, otherwise null, so a caller can decide whether to fall back.
 */
// Keep the main character in frame when the landscape art fills a phone screen.
const mobileArtPositions = {
  "the-last-of-us": "74% center",
  "prince-of-persia": "70% center",
  "beyond-two-souls": "64% center",
  kena: "68% center",
  hellblade: "12% center",
  detroit: "75% center",
  plague: "65% center",
  control: "68% center",
  "final-fantasy": "52% center",
  cyberpunk: "70% center",
  "it-takes-two": "50% center",
  "nier-automata": "53% center",
  "resident-evil": "60% center",
  "ghost-of-tsushima": "65% center",
};

export const gamesWithArt = games.map((game) => ({
  ...game,
  wide: wideArt[game.id] ?? null,
  mobileArtPosition: mobileArtPositions[game.id] ?? "center",
}));

import TehranPeople from "~/assets/img/photography/tehran-people.jpg";
import Flower from "~/assets/img/photography/flower.jpg";
import Street from "~/assets/img/photography/street.jpg";
import MiladTower from "~/assets/img/photography/tehran-milad.jpg";
import AstaraSnow from "~/assets/img/photography/astara-snow.jpg";
import Airplane from "~/assets/img/photography/airplane.jpg";
import Hormuz from "~/assets/img/photography/hormoz.jpg";

import TheLastOfUs from "~/assets/img/gaming/the-last-of-us.jpg";
import PrinceOfPersia from "~/assets/img/gaming/prince-of-persia.jpg";
import BeyondTwoSouls from "~/assets/img/gaming/beyond-two-souls.jpg";
import Kena from "~/assets/img/gaming/kena.jpg";
import Hellblade from "~/assets/img/gaming/hellblade.jpg";
import Detroit from "~/assets/img/gaming/detroit.jpg";
import Plague from "~/assets/img/gaming/plague.jpg";
import Control from "~/assets/img/gaming/control.jpg";
import FinalFantasy from "~/assets/img/gaming/final-fantasy.jpg";
import Cyberpunk from "~/assets/img/gaming/cyberpunk.jpg";
import GhostOfTsushima from "~/assets/img/gaming/ghost-of-tsushima.jpg";
import ItTakesTwo from "~/assets/img/gaming/it-takes-two.jpg";
import NierAutomata from "~/assets/img/gaming/nier-automata.jpg";
import ResidentEvil from "~/assets/img/gaming/resident-evil.jpg";

/**
 * Photography mosaic. `id` doubles as the CSS class that places the tile on
 * the section's grid, so ids must stay in sync with PhotographyBlock styles.
 */
export const photos = [
  { id: "tehran-people", src: TehranPeople, alt: "People walking at night in Tehran", title: "People", place: "Tehran" },
  { id: "flower", src: Flower, alt: "Flower close-up", title: "Flower", place: "Astara" },
  { id: "street", src: Street, alt: "Street photography scene", title: "Street", place: "Astara" },
  { id: "milad-tower", src: MiladTower, alt: "Milad Tower", title: "Tower", place: "Tehran" },
  { id: "airplane", src: Airplane, alt: "Airplane in the sky", title: "Airplane", place: "Tehran" },
  { id: "astara-snow", src: AstaraSnow, alt: "Snowy landscape in Astara", title: "Snow", place: "Astara" },
  { id: "hormuz", src: Hormuz, alt: "Mountain in Hormuz island", title: "Mountain", place: "Hormuz" },
];

/** The hero background is the same shot as the first photography tile. */
export const heroPhoto = photos[0];

/**
 * Favourite games. `studio`, `year` and `genre` are public facts about each
 * title; `blurb` describes the game, not my opinion of it. The slide's accent
 * colour is sampled from the artwork at runtime, so it is never hand-guessed.
 */
export const games = [
  {
    id: "the-last-of-us",
    src: TheLastOfUs,
    title: "The Last of Us",
    studio: "Naughty Dog",
    year: 2013,
    genre: "Action-adventure",
    blurb:
      "A smuggler escorts a teenage girl across a collapsed United States. Its reputation rests on the writing and performances rather than the shooting.",
  },
  {
    id: "prince-of-persia",
    src: PrinceOfPersia,
    title: "Prince of Persia: Warrior Within",
    studio: "Ubisoft",
    year: 2004,
    genre: "Action-adventure",
    blurb:
      "The darker turn in the Sands of Time trilogy, built on acrobatic traversal, time manipulation and a hostile island fortress.",
  },
  {
    id: "beyond-two-souls",
    src: BeyondTwoSouls,
    title: "Beyond: Two Souls",
    studio: "Quantic Dream",
    year: 2013,
    genre: "Interactive drama",
    blurb:
      "Jodie's life told out of order, bound to an invisible entity. Choices steer the story more than any combat system does.",
  },
  {
    id: "kena",
    src: Kena,
    title: "Kena: Bridge of Spirits",
    studio: "Ember Lab",
    year: 2021,
    genre: "Action-adventure",
    blurb:
      "A spirit guide clears a corrupted forest, in a world animated to the standard of a feature film.",
  },
  {
    id: "hellblade",
    src: Hellblade,
    title: "Hellblade: Senua's Sacrifice",
    studio: "Ninja Theory",
    year: 2017,
    genre: "Action-adventure",
    blurb:
      "A Pict warrior's journey into Norse myth, told through binaural audio that puts Senua's psychosis inside your headphones.",
  },
  {
    id: "detroit",
    src: Detroit,
    title: "Detroit: Become Human",
    studio: "Quantic Dream",
    year: 2018,
    genre: "Interactive drama",
    blurb:
      "Three androids in a near-future Detroit, across a branching story that visibly maps every path you did not take.",
  },
  {
    id: "plague",
    src: Plague,
    title: "A Plague Tale: Innocence",
    studio: "Asobo Studio",
    year: 2019,
    genre: "Stealth adventure",
    blurb:
      "Two siblings cross plague-era France, where light is the only thing holding back the rats.",
  },
  {
    id: "control",
    src: Control,
    title: "Control",
    studio: "Remedy Entertainment",
    year: 2019,
    genre: "Action-adventure",
    blurb:
      "A federal bureau housed in a building that rearranges itself. Brutalist concrete, telekinesis, and paperwork about the impossible.",
  },
  {
    id: "final-fantasy",
    src: FinalFantasy,
    title: "Final Fantasy",
    studio: "Square Enix",
    genre: "Role-playing",
    blurb:
      "Square Enix's long-running RPG series, built on party combat, summons and scores that outlive the consoles they shipped on.",
  },
  {
    id: "cyberpunk",
    src: Cyberpunk,
    title: "Cyberpunk 2077",
    studio: "CD Projekt Red",
    year: 2020,
    genre: "Action RPG",
    blurb:
      "Night City, rebuilt over years of patches into the dense open world it was pitched as.",
  },
  {
    id: "it-takes-two",
    src: ItTakesTwo,
    title: "It Takes Two",
    studio: "Hazelight Studios",
    year: 2021,
    genre: "Co-op platformer",
    blurb:
      "Split-screen only, two players required, and a new mechanic in almost every chapter.",
  },
  {
    id: "nier-automata",
    src: NierAutomata,
    title: "NieR: Automata",
    studio: "PlatinumGames",
    year: 2017,
    genre: "Action RPG",
    blurb:
      "Androids fight machines in a ruined world, across multiple playthroughs that each reframe what the last one meant.",
  },
  {
    id: "resident-evil",
    src: ResidentEvil,
    title: "Resident Evil Village",
    studio: "Capcom",
    year: 2021,
    genre: "Survival horror",
    blurb:
      "First-person horror through a snowbound village and its castle, leaning further into action than the entry before it.",
  },
  {
    id: "ghost-of-tsushima",
    src: GhostOfTsushima,
    title: "Ghost of Tsushima",
    studio: "Sucker Punch",
    year: 2020,
    genre: "Action-adventure",
    blurb:
      "A samurai abandons his code to fight the Mongol invasion, on an island built to be looked at.",
  },
];

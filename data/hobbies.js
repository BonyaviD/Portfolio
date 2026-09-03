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

export const games = [
  { id: "the-last-of-us", src: TheLastOfUs, title: "The Last of Us" },
  { id: "prince-of-persia", src: PrinceOfPersia, title: "Prince of Persia" },
  { id: "beyond-two-souls", src: BeyondTwoSouls, title: "Beyond: Two Souls" },
  { id: "kena", src: Kena, title: "Kena: Bridge of Spirits" },
  { id: "hellblade", src: Hellblade, title: "Hellblade: Senua's Sacrifice" },
  { id: "detroit", src: Detroit, title: "Detroit: Become Human" },
  { id: "plague", src: Plague, title: "A Plague Tale: Innocence" },
  { id: "control", src: Control, title: "Control" },
  { id: "final-fantasy", src: FinalFantasy, title: "Final Fantasy" },
  { id: "cyberpunk", src: Cyberpunk, title: "Cyberpunk 2077" },
  { id: "it-takes-two", src: ItTakesTwo, title: "It Takes Two" },
  { id: "nier-automata", src: NierAutomata, title: "NieR: Automata" },
  { id: "resident-evil", src: ResidentEvil, title: "Resident Evil Village" },
  { id: "ghost-of-tsushima", src: GhostOfTsushima, title: "Ghost of Tsushima" },
];

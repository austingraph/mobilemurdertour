import type { LngLat } from "../lib/geo";

/**
 * Tour content for the Austin "Servant Girl" murders of 1884–1885,
 * as chronicled in Skip Hollandsworth's *The Midnight Assassin*.
 *
 * A note on dates: the killings ran from December 30, 1884 to
 * December 24, 1885 (not 1890, as is sometimes misremembered).
 *
 * ⚠️ COORDINATES ARE APPROXIMATE. Austin's street names changed in 1886
 * (Pecan → 6th, Hickory → 8th, Water → Cesar Chavez, etc.) and most of the
 * original structures are gone. Positions below were placed from the
 * historical addresses mapped onto the modern grid — walk the route with the
 * book or the AAHC/THC archives and refine them in this file or in
 * web/content/tour.json. Each stop's `addressThen` records the 1885 address.
 */

export interface TourStop {
  id: string;
  /** Order along the walking route (1-based). */
  order: number;
  title: string;
  victim?: string;
  date?: string;
  addressThen?: string;
  addressNow: string;
  coordinate: LngLat; // [lng, lat]
  /** Meters; overrides the global geofence radius when set. */
  radiusM?: number;
  /** One line shown on cards and notifications. */
  teaser: string;
  /** The story told at the stop. Paragraphs separated by \n\n. */
  story: string;
  /** Filename under {PAGES_BASE_URL}/media/, e.g. "mollie-smith.mp4". */
  video?: string;
  /** Which in-app AR experience this stop offers. */
  ar?: "ghost" | "webxr";
  /** Path under PAGES_BASE_URL for the WebXR/model-viewer page. */
  arPage?: string;
  /** True for stops that are optional side-trips off the main loop. */
  optional?: boolean;
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: "intro-avenue",
    order: 1,
    title: "The Avenue, 1885",
    addressNow: "6th St & Congress Ave",
    coordinate: [-97.7427, 30.2679],
    teaser: "A boomtown of 17,000 — gaslights, mule cars, and something in the dark.",
    story:
      "Stand at the crossing of Congress Avenue and old Pecan Street. In 1885 this was the heart of a raw, ambitious little capital: a new university on the hill, a granite capitol rising from the ashes of the old one, saloons and mule-drawn streetcars, and dark — truly dark — nights. There were no streetlights to speak of beyond a few gas lamps. When the moon was down, the town vanished.\n\nOver twelve months, someone used that darkness. Eight people were killed — seven women and one man — and eight more gravely wounded. The first victims were Black women who worked as cooks and housekeepers in the homes of white families, which is why the papers called the case the \"Servant Girl Murders.\" The killer was never caught. Some historians argue he was America's first tracked serial killer, three years before Jack the Ripper.\n\nTonight you'll walk to the places where it happened, hear who these people were, and see how a terrified city changed itself — including, legend says, the moonlight towers that still glow over Austin.\n\nA request before we set out: these were real people, most of them Black women whose lives were barely recorded except in the manner of their deaths. We walk to remember them, not the man who killed them.",
    video: "intro.mp4",
  },
  {
    id: "mollie-smith",
    order: 2,
    title: "The First Cry in the Dark",
    victim: "Mollie Smith, 25",
    date: "December 30, 1884",
    addressThen: "901 W. Pecan St.",
    addressNow: "Near 901 W 6th St",
    coordinate: [-97.7534, 30.2706],
    teaser: "The night after Christmas week, the quiet west side woke to screams.",
    story:
      "Mollie Smith cooked and kept house for the Hall family, and lived with Walter Spencer in a small room attached to the house that stood here on West Pecan Street. In the small hours of December 31, 1884, someone came through the dark, struck Walter nearly to death as he slept, and carried Mollie out into the yard.\n\nShe was found the next morning in the snow by the outhouse, killed by an axe. She was twenty-five. The Austin Daily Statesman gave the murder a few paragraphs; the police arrested Walter's rival, then let him go. Nobody imagined it was a beginning.\n\nLook west along 6th Street. In 1884 this was the edge of town — beyond here, cotton fields and darkness. The killer came and went without a single witness, a pattern that would repeat all year.",
    video: "mollie-smith.mp4",
    ar: "ghost",
  },
  {
    id: "eliza-shelley",
    order: 3,
    title: "A Mother of Three",
    victim: "Eliza Shelley, 30",
    date: "May 7, 1885",
    addressThen: "Cabin behind Dr. L. B. Johnson's home, near San Jacinto & Cypress St.",
    addressNow: "San Jacinto Blvd & E 3rd St (approx.)",
    coordinate: [-97.7404, 30.2635],
    teaser: "Five months of quiet, then the killer returned — with the same weapon.",
    story:
      "Eliza Shelley cooked for the family of Dr. Lucien Johnson and lived in a cabin behind their house with her three young sons. On the night of May 6, 1885, her children woke to find a man in the cabin. He told the oldest boy to be still and covered him with a blanket.\n\nEliza was found on the cabin floor the next morning. Once again the weapon was an axe; once again there was money untouched and nothing stolen. The police blamed, in turn, a former husband, a neighbor, and a nineteen-year-old with an intellectual disability whose bare footprints didn't match the tracks in the yard. All were released.\n\nTwo attacks, same method, same silence. The Statesman began, uneasily, to count.",
    video: "eliza-shelley.mp4",
    ar: "ghost",
  },
  {
    id: "irene-cross",
    order: 4,
    title: "Two Weeks Later",
    victim: "Irene Cross",
    date: "May 23, 1885",
    addressThen: "Cabin near San Jacinto St., blocks from the Shelley cabin",
    addressNow: "San Jacinto Blvd & E 5th St (approx.)",
    coordinate: [-97.7395, 30.2661],
    teaser: "The third attack came just blocks away, barely two weeks on.",
    story:
      "Irene Cross was a cook, living near San Jacinto Street with her sleeping nephew when the man came in the night of May 22–23. She survived long enough to describe him only as \"a big chunky negro… barefooted, with his pants rolled up.\" She died of her wounds the next day; this time the blade had been a knife.\n\nThree attacks on Black serving women in five months, all within a mile of the Avenue. The city's white establishment told itself a comfortable story — that this was violence inside the Black community — and the police pursued it with corresponding laziness. Black Austinites knew better. Men began sitting up at night with shotguns across their knees, watching over the cabins behind the big houses.\n\nNothing about it made ordinary criminal sense: nothing was ever stolen, and the attacks came in the darkest hours of moonless nights.",
    ar: "ghost",
  },
  {
    id: "mary-ramey",
    order: 5,
    title: "The Youngest",
    victim: "Mary Ramey, 11",
    date: "August 30, 1885",
    addressThen: "Behind Valentine Weed's home, San Jacinto near Cedar St.",
    addressNow: "San Jacinto Blvd & E 4th St (approx.)",
    coordinate: [-97.7399, 30.2648],
    teaser: "In August the killer did something the city could not look away from.",
    story:
      "Rebecca Ramey worked for Valentine Weed and lived behind his house with her eleven-year-old daughter, Mary. In the pre-dawn of August 30, both were attacked as they slept. Rebecca survived. Mary was carried out to the wash house behind the home and murdered there — a child.\n\nBloodhounds were brought in and followed a trail to the river before losing it. The city posted rewards; the papers, at last, used the word that had been hanging over the summer: that one man, the same man, was hunting through Austin's nights.\n\nMary Ramey is the quietest name in this story and the heaviest. Pause here a moment for her before we walk on.",
    video: "mary-ramey.mp4",
  },
  {
    id: "gracie-vance",
    order: 6,
    title: "The Night of Two Attacks",
    victim: "Gracie Vance & Orange Washington",
    date: "September 28, 1885",
    addressThen: "Servants' quarters behind Maj. W. B. Dunham's place (site approximate)",
    addressNow: "San Jacinto & E MLK Jr Blvd area (approx. — optional side trip)",
    coordinate: [-97.7346, 30.2812],
    radiusM: 60,
    teaser: "A locked door, a guard dog, a man keeping watch — none of it mattered.",
    optional: true,
    story:
      "By late September the servants' quarters of Austin were fortified: barred doors, dogs, men keeping watch in shifts. Gracie Vance, a cook, lived in a cabin behind Major Dunham's home with Orange Washington and two friends. They had taken every precaution the times allowed.\n\nThe killer came through the window. Orange Washington was mortally wounded where he lay; Gracie was carried over a fence to the stable and killed there. A silver watch — one of the only things ever taken — turned up under the mattress, planted or dropped. That same night, across town, another woman was attacked in her bed and survived.\n\nAustin tipped into open panic. Hired watchmen patrolled, vigilance committees formed, and hundreds of Black men were stopped, jailed, and released as the police flailed. The killer, whoever he was, walked through all of it like fog.",
    ar: "ghost",
  },
  {
    id: "susan-hancock",
    order: 7,
    title: "Christmas Eve, Part I",
    victim: "Susan Hancock, 44",
    date: "December 24, 1885",
    addressThen: "203 E. Water St.",
    addressNow: "E Cesar Chavez St between Brazos & San Jacinto (approx.)",
    coordinate: [-97.7414, 30.2633],
    teaser: "On Christmas Eve the killer crossed a line the city thought protected it.",
    story:
      "For three quiet months Austin exhaled. Then, near midnight on Christmas Eve 1885, the pattern broke in the way the city had told itself was impossible: the victim was a white woman, attacked in her own bedroom in a respectable house on Water Street.\n\nSusan Hancock's husband found her in the backyard, terribly wounded by an axe; she died without waking. The Statesman called her \"one of the most refined ladies in Austin,\" a sentence that says everything about whose deaths had been allowed to pass quietly all year.\n\nThe killer left the same signature as always — the small hours, the silence, nothing stolen, a trail that bloodhounds lost at the river. And he wasn't finished that night.",
    video: "susan-hancock.mp4",
  },
  {
    id: "eula-phillips",
    order: 8,
    title: "Christmas Eve, Part II",
    victim: "Eula Phillips, 17",
    date: "December 24, 1885",
    addressThen: "Alley behind 302 W. Hickory St.",
    addressNow: "W 8th St near Lavaca St (approx.)",
    coordinate: [-97.7446, 30.2718],
    teaser: "One hour later, a mile away: the final murder — and the strangest.",
    story:
      "Within the same hour, seventeen-year-old Eula Phillips was taken from the house she shared with her husband's family on Hickory Street and killed in the alley that ran behind it. Her husband Jimmy lay wounded in their bed; their toddler slept beside him, unharmed.\n\nEula was young, white, and — the inquest revealed — living a complicated, secret life that scandalized the city. Austin finally, fully lost its mind. Mass meetings were held; the mayor hired Pinkerton detectives; prosecutors, needing anyone, tried Jimmy Phillips for his own wife's murder and Moses Hancock for Susan's. Both prosecutions collapsed.\n\nAnd then — nothing. After Christmas Eve 1885, the murders simply stopped. No confession, no conviction, no name. Theories have been argued for 140 years: a cook named Nathan Elgin, killed by police in 1886, whose severed toe some say matched tracks at the scenes; a Malay ship's cook who left for Southampton; even, improbably, a young Jack the Ripper. The dark kept its secret.",
    video: "eula-phillips.mp4",
    ar: "ghost",
  },
  {
    id: "moonlight-tower",
    order: 9,
    title: "Epilogue: The Moonlight Towers",
    date: "1895 — present",
    addressNow: "Moonlight Tower, W 9th St & Guadalupe St",
    coordinate: [-97.7458, 30.2727],
    teaser: "The city's answer to a year of darkness still burns over Austin.",
    story:
      "A decade after the murders, Austin raised thirty-one iron towers, each 165 feet tall, crowned with carbon-arc lamps that washed whole neighborhoods in artificial moonlight. Seventeen of them still stand — this one among them — and they remain the only system of its kind left in the world.\n\nCity legend says the towers were Austin's answer to the Midnight Assassin: never again would the town be dark enough to hide him. The truth is more municipal — they were bought secondhand from Detroit in a fit of civic modernization — but the legend endures because it carries the emotional truth of 1885. This city remembers being afraid of the dark.\n\nLook up. The lamps you see are the same violet-white glow that ended the era of true night in Austin. Mollie Smith, Eliza Shelley, Irene Cross, Mary Ramey, Gracie Vance, Orange Washington, Susan Hancock, Eula Phillips. Say the names, and walk home in the light.",
    video: "moonlight-tower.mp4",
    ar: "webxr",
    arPage: "ar/moonlight-tower.html",
  },
];

export const TOUR_TITLE = "The Midnight Assassin: Austin 1885";

export const TOUR_INTRO =
  "A guided night walk through downtown Austin to the sites of the 1884–85 \"Servant Girl\" murders — America's first hunted serial killer, three years before the Ripper. ~2.5 km, 60–90 minutes.";

/** GeoJSON line joining the main (non-optional) stops in walking order. */
export function routeGeoJSON(): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: TOUR_STOPS.filter((s) => !s.optional)
        .sort((a, b) => a.order - b.order)
        .map((s) => s.coordinate),
    },
  };
}

export function stopById(id: string): TourStop | undefined {
  return TOUR_STOPS.find((s) => s.id === id);
}

export type Ability = {
  kind: "Stand" | "Technique";
  name: string;
};

export type Character = {
  slug: string;
  name: string;
  role: string;
  age?: number;
  race: { number?: string; horse: string } | null;
  ability: Ability;
  summary: string;
  motive: string;
};

export type PosterCard = {
  slug: string;
  name: string;
  image: string;
};

export const POSTER_SIZE = { width: 720, height: 1077 } as const;

export const characters: Character[] = [
  {
    slug: "johnny-joestar",
    name: "Johnny Joestar",
    role: "Former star jockey",
    age: 19,
    race: { number: "939", horse: "Slow Dancer" },
    ability: { kind: "Stand", name: "Tusk" },
    summary:
      "Once a celebrated young jockey, Johnny lost the use of his legs after being shot in the spine. Before the race began, a touch of Gyro Zeppeli's steel ball made them move again.",
    motive:
      "He rides after Gyro to learn the secret of the Spin, the only power that might heal him for good.",
  },
  {
    slug: "gyro-zeppeli",
    name: "Gyro Zeppeli",
    role: "Executioner from the Kingdom of Naples",
    age: 24,
    race: { number: "B-636", horse: "Valkyrie" },
    ability: { kind: "Technique", name: "The Spin" },
    summary:
      "Heir to a family of royal executioners and a master of the Spin, a Zeppeli technique he channels through his signature steel balls.",
    motive:
      "He races to win a royal pardon for a young boy he has been ordered to execute.",
  },
  {
    slug: "lucy-steel",
    name: "Lucy Steel",
    role: "Wife of the race promoter",
    age: 14,
    race: null,
    ability: { kind: "Stand", name: "Ticket to Ride" },
    summary:
      "The young wife of Steven Steel, the promoter who organized the Steel Ball Run. Quiet and loyal, she is also a gifted lip reader.",
    motive:
      "After uncovering the President's secret plans for the race, she risks everything to protect her husband, quietly helping Johnny and Gyro.",
  },
  {
    slug: "diego-brando",
    name: "Diego Brando",
    role: "British champion jockey",
    age: 20,
    race: { number: "001", horse: "Silver Bullet" },
    ability: { kind: "Stand", name: "Scary Monsters" },
    summary:
      "A genius jockey from England who grew up poor in a stable and is hailed as a favorite to win. His Stand turns him into a dinosaur.",
    motive:
      "He races for prestige, one more rung in his climb to the top of society, until the Saint's Corpse catches his eye.",
  },
  {
    slug: "hot-pants",
    name: "Hot Pants",
    role: "Nun and racer",
    age: 23,
    race: { horse: "Gets Up" },
    ability: { kind: "Stand", name: "Cream Starter" },
    summary:
      "A skilled rider and a nun whose Stand, Cream Starter, is a spray that can mold living flesh, sealing wounds or reshaping a face.",
    motive:
      "She rides on orders from the Vatican and the Kingdom of Naples to investigate the Saint's Corpse and keep it out of the American government's hands.",
  },
  {
    slug: "mountain-tim",
    name: "Mountain Tim",
    role: "Cowboy and bounty hunter",
    age: 31,
    race: { number: "007", horse: "Ghost Rider in the Sky" },
    ability: { kind: "Stand", name: "Oh! Lonesome Me" },
    summary:
      "A celebrated cowboy with a lawman's heart. His Stand lets him slide parts of his own body along his lasso.",
    motive:
      "Billed as one of the favorites, he teams up with Johnny and Gyro early on to take down a band of murderous “terrorists.”",
  },
  {
    slug: "funny-valentine",
    name: "Funny Valentine",
    role: "23rd President of the United States",
    age: 43,
    race: null,
    ability: { kind: "Stand", name: "Dirty Deeds Done Dirt Cheap" },
    summary:
      "The President of the United States, a devoted patriot whose Stand lets him slip between parallel worlds.",
    motive:
      "He secretly backs the Steel Ball Run as cover to gather the scattered Saint's Corpse, which he believes will make America the greatest nation on Earth.",
  },
  {
    slug: "sandman",
    name: "Sandman",
    role: "Runner from the Arizona desert",
    age: 18,
    race: { number: "C-990", horse: "None, he runs on foot" },
    ability: { kind: "Stand", name: "In a Silent Way" },
    summary:
      "A young man from the Arizona desert who crosses the continent on foot, keeping pace with the horses thanks to his unique running technique.",
    motive:
      "Though his own people have cast him out, he hopes the prize money will buy back his ancestors' land.",
  },
  {
    slug: "pocoloco",
    name: "Pocoloco",
    role: "Farmer from Georgia",
    age: 21,
    race: { number: "A-777", horse: "Hey! Ya!" },
    ability: { kind: "Stand", name: "Hey Ya!" },
    summary:
      "A carefree Georgia farmer with a gift for reading horses and an even greater streak of luck. His Stand exists only to cheer him on.",
    motive:
      "A fortune teller told him his luck was about to peak, so he signed up for the biggest race in history.",
  },
  {
    slug: "ringo-roadagain",
    name: "Ringo Roadagain",
    role: "Gunslinger",
    race: null,
    ability: { kind: "Stand", name: "Mandom" },
    summary:
      "A calm gunslinger who lives for duels, convinced that facing a true killer is the only way to grow as a man. His Stand rewinds time by six seconds.",
    motive:
      "Working for President Valentine, he lies in wait near Kansas City to ambush the racers carrying the Saint's Corpse.",
  },
  {
    slug: "blackmore",
    name: "Blackmore",
    role: "Agent of the President",
    race: null,
    ability: { kind: "Stand", name: "Catch the Rainbow" },
    summary:
      "One of President Valentine's most loyal agents: calm, analytical and relentless. His Stand, a mask, gives him command over the rain.",
    motive:
      "When someone is caught spying on the President, Blackmore is sent to track the intruder down and silence them.",
  },
  {
    slug: "wekapipo",
    name: "Wekapipo",
    role: "Exiled royal guard of Naples",
    age: 31,
    race: null,
    ability: { kind: "Technique", name: "Wrecking Ball" },
    summary:
      "A former royal guard of the Kingdom of Naples, now exiled in America. He wields the Wrecking Ball, the royal guard's own steel ball technique.",
    motive:
      "Chasing a comfortable life in his new country, he takes up work for President Valentine, which puts him on Gyro Zeppeli's trail.",
  },
];

export function getCharacter(slug: string) {
  return characters.find((character) => character.slug === slug);
}

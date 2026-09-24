import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import { notFound } from "next/navigation";
import { characters, getCharacter, type Character } from "@/lib/characters";
import { mastheadFont, newsFont } from "../fonts";
import styles from "./newspaper.module.css";

// Page loaded inside the board's iframe; it also works when opened directly.

export const dynamicParams = false;

export function generateStaticParams() {
  return characters.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/newspaper/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getCharacter(slug)?.name ?? "Newspaper" };
}

function factsOf({ age, race, ability }: Character) {
  return [
    { label: "Age", value: age ? String(age) : "Unknown" },
    { label: "Race No.", value: race ? (race.number ?? "Unrecorded") : "Not a racer" },
    { label: "Horse", value: race?.horse ?? "—" },
    { label: ability.kind, value: ability.name },
  ];
}

export default async function NewspaperPage({ params }: PageProps<"/newspaper/[slug]">) {
  const { slug } = await params;
  const character = getCharacter(slug);
  if (!character) notFound();

  // Imported (not referenced by path) so a replaced photo gets a new URL.
  const { default: portrait }: { default: StaticImageData } = await import(
    `@/public/portraits/${slug}.webp`
  );

  return (
    <main className={`${styles.page} ${mastheadFont.variable} ${newsFont.variable}`}>
      <article className={styles.sheet}>
        <header className={styles.masthead}>
          <p className={styles.topline}>
            <span>Vol. VII</span>
            <span>San Diego — New York</span>
            <span>Price 5¢</span>
          </p>
          <p className={styles.title}>The Steel Ball Run Gazette</p>
          <p className={styles.dateline}>
            <span className={styles.wide}>Extra Edition</span>
            <time dateTime="1890-09-25">Thursday, September 25, 1890</time>
            <span className={styles.wide}>6,000 km Race</span>
          </p>
        </header>

        <p className={styles.kicker}>{character.role}</p>
        <h1 className={styles.headline}>{character.name}</h1>

        <div className={styles.story}>
          <figure className={styles.photo}>
            <Image
              src={portrait}
              alt={`Portrait of ${character.name}`}
              fill
              sizes="(max-width: 599px) 40vw, 250px"
              loading="eager"
              className={styles.image}
            />
          </figure>

          <dl className={styles.facts}>
            {factsOf(character).map(({ label, value }) => (
              <div key={label} className={styles.fact}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className={styles.text}>
            <p className={styles.lede}>{character.summary}</p>
            <h2 className={styles.subhead}>The motive</h2>
            <p>{character.motive}</p>
          </div>
        </div>

        <footer className={styles.credits}>
          Art by Hirohiko Araki · Facts from the JoJo Wiki
        </footer>
      </article>
    </main>
  );
}

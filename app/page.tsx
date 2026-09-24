import { BulletinBoard } from "@/components/board/BulletinBoard";
import { DesertAmbience } from "@/components/desert/DesertAmbience";
import { DesertBackdrop } from "@/components/desert/DesertBackdrop";
import { WindDust } from "@/components/desert/WindDust";
import { characters } from "@/lib/characters";
import { posterBackground } from "@/lib/poster-image";
import styles from "./page.module.css";

export default async function Home() {
  const posters = await Promise.all(
    characters.map(async ({ slug, name }) => ({
      slug,
      name,
      image: await posterBackground(slug),
    })),
  );

  return (
    <main className={styles.scene}>
      <h1 className="sr-only">Steel Ball Run: wanted posters</h1>
      <DesertAmbience>
        <DesertBackdrop />
      </DesertAmbience>
      <BulletinBoard posters={posters} />
      <WindDust />
      <div className={styles.atmosphere} aria-hidden />
    </main>
  );
}

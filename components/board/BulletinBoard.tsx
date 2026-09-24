"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useCallback, useState } from "react";
import type { PosterCard } from "@/lib/characters";
import { windControl } from "@/lib/wind";
import { NewspaperDialog, type NewspaperSelection } from "./NewspaperDialog";
import { WantedPoster, type PosterOrigin, type RestPose } from "./WantedPoster";
import styles from "./BulletinBoard.module.css";

gsap.registerPlugin(useGSAP);

const POSES: RestPose[] = [
  { rotate: -2.2, x: -1.5, y: 1 },
  { rotate: 1.6, x: 2, y: -1.5 },
  { rotate: -0.9, x: -0.5, y: 2 },
  { rotate: 2.4, x: 1, y: -0.5 },
  { rotate: 1.2, x: 1.5, y: -2 },
  { rotate: -1.8, x: -2, y: 0.5 },
  { rotate: 0.7, x: 0.5, y: -1 },
  { rotate: -2.6, x: -1, y: 1.5 },
  { rotate: 1.9, x: -1.5, y: -1 },
  { rotate: -1.3, x: 1, y: 2 },
  { rotate: 2.8, x: -0.5, y: -1.5 },
  { rotate: -0.6, x: 2, y: 0.5 },
];

export function BulletinBoard({ posters }: { posters: PosterCard[] }) {
  const [selection, setSelection] = useState<NewspaperSelection | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        windControl,
        { intensity: 0 },
        { intensity: 1, duration: 3.5, delay: 1.6, ease: "sine.inOut" },
      );
    });
    return () => mm.revert();
  });

  const handleOpen = useCallback((poster: PosterCard, origin: PosterOrigin) => {
    setSelection((current) => current ?? { poster, ...origin });
  }, []);

  const handleClosed = useCallback(() => setSelection(null), []);

  return (
    <div className={styles.stage}>
      <div className={styles.board}>
        <span className={`${styles.post} ${styles.postLeft}`} aria-hidden />
        <span className={`${styles.post} ${styles.postRight}`} aria-hidden />
        <span className={styles.surface} aria-hidden />
        <span className={styles.frame} aria-hidden>
          <span className={`${styles.rail} ${styles.railTop}`} />
          <span className={`${styles.rail} ${styles.railBottom}`} />
          <span className={`${styles.rail} ${styles.railLeft}`} />
          <span className={`${styles.rail} ${styles.railRight}`} />
        </span>

        <ul className={styles.grid} aria-label="Wanted posters">
          {posters.map((poster, index) => (
            <WantedPoster
              key={poster.slug}
              poster={poster}
              index={index}
              pose={POSES[index % POSES.length]}
              onOpen={handleOpen}
            />
          ))}
        </ul>
      </div>

      <NewspaperDialog selection={selection} onClosed={handleClosed} />
    </div>
  );
}

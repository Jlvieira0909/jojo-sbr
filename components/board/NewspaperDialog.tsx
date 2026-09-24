"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from "react";
import { POSTER_SIZE, type PosterCard } from "@/lib/characters";
import { setAmbientPaused } from "@/lib/wind";
import type { PosterOrigin } from "./WantedPoster";
import styles from "./NewspaperDialog.module.css";

gsap.registerPlugin(useGSAP);

const POSTER_RATIO = POSTER_SIZE.width / POSTER_SIZE.height;

export type NewspaperSelection = PosterOrigin & { poster: PosterCard };

type NewspaperDialogProps = {
  selection: NewspaperSelection | null;
  onClosed: () => void;
};

type Controls = { close: () => void; reveal: () => void };

type Box = { left: number; top: number; width: number; height: number };

function fitTransform(panel: Box, target: Box, rotation: number) {
  return {
    x: target.left + target.width / 2 - (panel.left + panel.width / 2),
    y: target.top + target.height / 2 - (panel.top + panel.height / 2),
    scaleX: target.width / panel.width,
    scaleY: target.height / panel.height,
    rotation,
  };
}

function posterBox(rect: DOMRect, rotation: number): Box {
  const angle = (Math.abs(rotation) * Math.PI) / 180;
  const height =
    rect.height / (Math.cos(angle) + POSTER_RATIO * Math.sin(angle));
  const width = height * POSTER_RATIO;
  return {
    left: rect.left + rect.width / 2 - width / 2,
    top: rect.top + rect.height / 2 - height / 2,
    width,
    height,
  };
}

export function NewspaperDialog({ selection, onClosed }: NewspaperDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const controls = useRef<Controls | null>(null);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const titleId = useId();

  const poster = selection?.poster;
  const loaded = poster !== undefined && loadedSlug === poster.slug;

  useGSAP(
    (_context, contextSafe) => {
      const dialog = dialogRef.current;
      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      const cover = coverRef.current;
      const closeButton = closeRef.current;
      if (
        !selection ||
        !contextSafe ||
        !dialog ||
        !backdrop ||
        !panel ||
        !cover ||
        !closeButton
      ) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const origin = selection.element;
      const root = document.documentElement;
      const previousOverflow = root.style.overflow;
      let closing = false;

      dialog.showModal();
      closeButton.focus({ preventScroll: true });
      root.style.overflow = "hidden";

      const layout = (): Box => ({
        left: panel.offsetLeft,
        top: panel.offsetTop,
        width: panel.offsetWidth,
        height: panel.offsetHeight,
      });

      let size = layout();

      const keepPosterShape = () => {
        const visualWidth =
          size.width * Number(gsap.getProperty(panel, "scaleX"));
        const visualHeight =
          size.height * Number(gsap.getProperty(panel, "scaleY"));
        gsap.set(cover, {
          scaleX: Math.min(1, (visualHeight * POSTER_RATIO) / visualWidth),
          scaleY: Math.min(1, visualWidth / (POSTER_RATIO * visualHeight)),
        });
      };

      const open = gsap.timeline({ onComplete: () => setAmbientPaused(true) });
      open
        .set(origin, { visibility: "hidden" })
        .fromTo(
          backdrop,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.55, ease: "power2.out" },
          0,
        );

      if (reduceMotion) {
        open
          .set(cover, { autoAlpha: 0 })
          .fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0)
          .set(closeButton, { opacity: 1 });
      } else {
        const start = fitTransform(
          size,
          posterBox(selection.rect, selection.rotation),
          selection.rotation,
        );
        open
          .fromTo(
            panel,
            start,
            {
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              duration: 0.85,
              ease: "power3.inOut",
              onUpdate: keepPosterShape,
            },
            0,
          )
          .fromTo(
            cover,
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.35, ease: "power1.in" },
            0.35,
          )
          .fromTo(
            closeButton,
            { opacity: 0, scale: 0.4 },
            { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" },
            0.75,
          );
        keepPosterShape();
      }

      const reveal = contextSafe(() => {
        const frame = frameRef.current;
        if (!frame || closing) return;
        const remaining = Math.max(open.duration() - open.time(), 0);
        gsap.fromTo(
          frame,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.45,
            delay: remaining,
            ease: "power1.out",
          },
        );
        frame.contentWindow?.addEventListener("keydown", (event) => {
          if (event.key === "Escape") controls.current?.close();
        });
      });

      const close = contextSafe(() => {
        if (closing) return;
        closing = true;
        open.kill();
        setAmbientPaused(false);

        const finish = () => {
          origin.style.visibility = "visible";
          dialog.close();
        };

        const frame = frameRef.current;
        const leave = gsap.timeline({ onComplete: finish });
        leave.to(frame ? [frame, closeButton] : closeButton, {
          autoAlpha: 0,
          duration: 0.18,
        });

        if (reduceMotion) {
          leave.to([panel, backdrop], { autoAlpha: 0, duration: 0.25 });
          return;
        }

        size = layout();
        const target = posterBox(
          origin.getBoundingClientRect(),
          selection.rotation,
        );
        leave
          .to(cover, { autoAlpha: 1, duration: 0.25, ease: "power1.out" }, 0.08)
          .to(
            panel,
            {
              ...fitTransform(size, target, selection.rotation),
              duration: 0.7,
              ease: "power3.inOut",
              onUpdate: keepPosterShape,
            },
            0.05,
          )
          .to(
            backdrop,
            { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" },
            0.25,
          );
      });

      controls.current = { close, reveal };

      return () => {
        controls.current = null;
        setAmbientPaused(false);
        root.style.overflow = previousOverflow;
        origin.style.visibility = "";
        if (dialog.open) dialog.close();
      };
    },
    { dependencies: [selection], revertOnUpdate: true },
  );

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    controls.current?.close();
  };

  const handleClose = () => {
    if (dialogRef.current?.open) return;
    setLoadedSlug(null);
    onClosed();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClose={handleClose}
    >
      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={() => controls.current?.close()}
      />

      <div ref={panelRef} className={styles.panel} aria-busy={!loaded}>
        <h2 id={titleId} className="sr-only">
          {poster ? `Newspaper: ${poster.name}` : "Newspaper"}
        </h2>

        <div className={styles.loader} data-visible={!loaded} aria-hidden>
          <span className={styles.ball} />
          <span className={styles.caption}>Printing the edition…</span>
        </div>

        {poster && (
          <iframe
            key={poster.slug}
            ref={frameRef}
            className={styles.frame}
            src={`/newspaper/${poster.slug}`}
            title={`Newspaper: ${poster.name}`}
            onLoad={() => {
              setLoadedSlug(poster.slug);
              controls.current?.reveal();
            }}
          />
        )}

        <div
          ref={coverRef}
          className={styles.cover}
          style={{ "--poster-image": poster?.image } as CSSProperties}
          aria-hidden
        />

        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={() => controls.current?.close()}
          aria-label="Close the newspaper"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}

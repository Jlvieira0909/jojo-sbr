"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type CSSProperties } from "react";
import type { PosterCard } from "@/lib/characters";
import { subscribeWind, windAt } from "@/lib/wind";
import styles from "./WantedPoster.module.css";

gsap.registerPlugin(useGSAP);

const STRIPS = 8;

export type RestPose = { rotate: number; x: number; y: number };

export type PosterOrigin = {
  element: HTMLElement;
  rect: DOMRect;
  rotation: number;
};

type WantedPosterProps = {
  poster: PosterCard;
  index: number;
  pose: RestPose;
  onOpen: (poster: PosterCard, origin: PosterOrigin) => void;
};

function PaperStrip({ index }: { index: number }) {
  return (
    <span
      className={styles.strip}
      style={{ "--strip": index } as CSSProperties}
      data-strip
    >
      <span className={styles.face}>
        <span className={styles.light} data-light />
      </span>
      {index + 1 < STRIPS && <PaperStrip index={index + 1} />}
    </span>
  );
}

export function WantedPoster({
  poster,
  index,
  pose,
  onOpen,
}: WantedPosterProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tiltRef = useRef<HTMLSpanElement>(null);
  const swayRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const button = buttonRef.current;
      const tilt = tiltRef.current;
      const sway = swayRef.current;
      const shadow = shadowRef.current;
      if (!button || !tilt || !sway || !shadow) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const strips = gsap.utils.toArray<HTMLElement>("[data-strip]", tilt);
        const lights = gsap.utils.toArray<HTMLElement>("[data-light]", tilt);
        const state = { calm: 1, hover: 0 };
        const phase = index * 2.4;
        let center = 0.5;

        const measure = () => {
          const rect = button.getBoundingClientRect();
          center = (rect.left + rect.width / 2) / window.innerWidth;
        };
        measure();
        window.addEventListener("resize", measure);

        const written = new Map<string, string>();
        const write = (
          el: HTMLElement,
          key: string,
          prop: "transform" | "opacity",
          value: string,
        ) => {
          if (written.get(key) === value) return;
          written.set(key, value);
          el.style[prop] = value;
        };

        const unsubscribe = subscribeWind((time) => {
          const wind = windAt(time, center) * state.calm;
          let lift = 0;

          for (let i = 0; i < STRIPS; i++) {
            const k = i / (STRIPS - 1);
            const curl = wind * 3.2 * k ** 1.25;
            const ripple =
              wind *
              2.4 *
              Math.sin(time * 4.6 - i * 0.8 + phase) *
              (0.2 + 0.8 * k);
            const flap =
              Math.max(0, wind - 0.55) *
              5 *
              Math.sin(time * 16 + i * 1.7 + phase) *
              k *
              k;
            let bend = i === 0 ? curl * 0.3 : curl + ripple + flap;
            if (lift + bend < 0) bend = -lift;
            lift += bend;

            const twist =
              wind * 1.3 * Math.sin(time * 1.9 + phase + i * 0.55) * k;
            write(
              strips[i],
              `strip${i}`,
              "transform",
              `rotateX(${bend.toFixed(1)}deg) rotateY(${twist.toFixed(1)}deg)`,
            );
            write(
              lights[i],
              `light${i}`,
              "opacity",
              Math.min(lift / 110, 0.16).toFixed(2),
            );
          }

          const swing = (
            -wind * 1.4 +
            wind * 1.2 * Math.sin(time * 1.25 + phase)
          ).toFixed(2);
          write(sway, "sway", "transform", `rotate(${swing}deg)`);
          write(
            shadow,
            "shadow",
            "transform",
            `translate(${(wind * 4 + state.hover * 5).toFixed(1)}px, ${(lift * 0.25 + state.hover * 12).toFixed(1)}px) rotate(${swing}deg) scale(${(1 + state.hover * 0.03).toFixed(3)})`,
          );
          write(
            shadow,
            "shadowOpacity",
            "opacity",
            (0.75 - state.hover * 0.25).toFixed(2),
          );
        });

        const rotateX = gsap.quickTo(tilt, "rotationX", {
          duration: 0.6,
          ease: "power3",
        });
        const rotateY = gsap.quickTo(tilt, "rotationY", {
          duration: 0.6,
          ease: "power3",
        });
        const glareX = gsap.quickTo(button, "--glare-x", {
          duration: 0.5,
          ease: "power2",
        });
        const glareY = gsap.quickTo(button, "--glare-y", {
          duration: 0.5,
          ease: "power2",
        });

        const raise = (active: boolean) => {
          gsap.to(tilt, {
            z: active ? 44 : 0,
            scale: active ? 1.03 : 1,
            duration: active ? 0.5 : 0.7,
            ease: active ? "back.out(1.7)" : "power3.out",
            overwrite: "auto",
          });
          gsap.to(state, {
            calm: active ? 0.2 : 1,
            hover: active ? 1 : 0,
            duration: active ? 0.45 : 1.2,
            ease: "power2.out",
            overwrite: "auto",
          });
          gsap.to(button, {
            "--glare": active ? 1 : 0,
            duration: 0.4,
            overwrite: "auto",
          });
        };

        const onPointerEnter = (event: PointerEvent) => {
          if (event.pointerType !== "touch") raise(true);
        };
        const onPointerMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const rect = button.getBoundingClientRect();
          const nx = gsap.utils.clamp(
            0,
            1,
            (event.clientX - rect.left) / rect.width,
          );
          const ny = gsap.utils.clamp(
            0,
            1,
            (event.clientY - rect.top) / rect.height,
          );
          rotateY((nx - 0.5) * 22);
          rotateX((0.5 - ny) * 18);
          glareX(nx * 100);
          glareY(ny * 100);
        };
        const onPointerLeave = () => {
          raise(false);
          rotateX(0);
          rotateY(0);
        };
        const onFocus = () => {
          if (button.matches(":focus-visible")) raise(true);
        };
        const onBlur = () => raise(false);

        button.addEventListener("pointerenter", onPointerEnter);
        button.addEventListener("pointermove", onPointerMove);
        button.addEventListener("pointerleave", onPointerLeave);
        button.addEventListener("focus", onFocus);
        button.addEventListener("blur", onBlur);

        return () => {
          unsubscribe();
          window.removeEventListener("resize", measure);
          button.removeEventListener("pointerenter", onPointerEnter);
          button.removeEventListener("pointermove", onPointerMove);
          button.removeEventListener("pointerleave", onPointerLeave);
          button.removeEventListener("focus", onFocus);
          button.removeEventListener("blur", onBlur);
          for (const el of [sway, shadow, ...strips]) el.style.transform = "";
          for (const el of [shadow, ...lights]) el.style.opacity = "";
        };
      });

      return () => mm.revert();
    },
    { scope: buttonRef },
  );

  const handleClick = () => {
    const button = buttonRef.current;
    const tilt = tiltRef.current;
    if (!button || !tilt) return;
    onOpen(poster, {
      element: button,
      rect: tilt.getBoundingClientRect(),
      rotation: pose.rotate,
    });
  };

  return (
    <li
      className={styles.slot}
      style={
        {
          "--i": index,
          "--strips": STRIPS,
          "--rest-rotate": `${pose.rotate}deg`,
          "--rest-x": `${pose.x}%`,
          "--rest-y": `${pose.y}%`,
        } as CSSProperties
      }
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.poster}
        style={{ "--poster-image": poster.image } as CSSProperties}
        aria-label={`Wanted poster for ${poster.name}: open the newspaper`}
        onClick={handleClick}
      >
        <span ref={shadowRef} className={styles.shadow} />
        <span ref={tiltRef} className={styles.tilt}>
          <span ref={swayRef} className={styles.sway}>
            <PaperStrip index={0} />
          </span>
          <span className={styles.nail} />
        </span>
      </button>
    </li>
  );
}

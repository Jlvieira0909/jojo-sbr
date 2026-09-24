"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, type ReactNode } from "react";
import {
  isAmbientPaused,
  subscribeAmbientPause,
  subscribeWind,
  windAt,
} from "@/lib/wind";

gsap.registerPlugin(useGSAP);

type Conditions = { motion: boolean; finePointer: boolean };

export function DesertAmbience({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          finePointer: "(pointer: fine)",
        },
        (context) => {
          const { motion, finePointer } = context.conditions as Conditions;
          if (!motion) return;

          const cleanups = [
            driftClouds(root),
            rollTumbleweeds(root),
            finePointer ? followPointer(root) : undefined,
          ];
          return () => cleanups.forEach((cleanup) => cleanup?.());
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}

function driftClouds(root: HTMLElement) {
  const clouds = gsap.utils
    .toArray<HTMLElement>("[data-cloud]", root)
    .map((el) => ({
      el,
      speed: Number(el.dataset.speed) || 8,
      start: 0,
      width: 0,
      travelled: 0,
    }));
  if (clouds.length === 0) return;

  let field = 0;
  const measure = () => {
    field =
      (clouds[0].el.offsetParent as HTMLElement | null)?.offsetWidth ??
      window.innerWidth;
    for (const cloud of clouds) {
      cloud.start = cloud.el.offsetLeft;
      cloud.width = cloud.el.offsetWidth;
    }
  };
  measure();
  window.addEventListener("resize", measure);

  const unsubscribe = subscribeWind((time, delta) => {
    const push = 0.6 + windAt(time, 0.5) * 1.2;
    for (const cloud of clouds) {
      cloud.travelled += cloud.speed * push * delta;
      const x = gsap.utils.wrap(
        -cloud.width,
        field,
        cloud.start + cloud.travelled,
      );
      cloud.el.style.transform = `translate3d(${(x - cloud.start).toFixed(1)}px, 0, 0)`;
    }
  });

  return () => {
    unsubscribe();
    window.removeEventListener("resize", measure);
    for (const cloud of clouds) cloud.el.style.transform = "";
  };
}

function rollTumbleweeds(root: HTMLElement) {
  const weed = root.querySelector<HTMLElement>("[data-tumbleweed]");
  const body = weed?.querySelector<HTMLElement>("[data-tumbleweed-body]");
  const shadow = weed?.querySelector<HTMLElement>("[data-tumbleweed-shadow]");
  if (!weed || !body || !shadow) return;

  let roll: gsap.core.Timeline | undefined;

  const launch = (delay: number) => {
    const size = weed.offsetWidth;
    const distance = window.innerWidth + size * 3;
    const duration = gsap.utils.random(6.5, 9.5);
    const hops = Math.round(duration * 0.8);
    const hop = duration / hops;

    roll = gsap.timeline({
      delay,
      paused: isAmbientPaused(),
      onComplete: () => launch(gsap.utils.random(9, 18)),
    });
    roll
      .set(weed, { autoAlpha: 1, x: -size * 1.5 })
      .to(weed, { x: distance - size * 1.5, duration, ease: "none" }, 0)
      .to(
        body,
        {
          rotation: `+=${(distance / (Math.PI * size)) * 360}`,
          duration,
          ease: "none",
        },
        0,
      );

    for (let i = 0; i < hops; i++) {
      const lift = size * gsap.utils.random(0.2, 0.85);
      roll
        .to(body, { y: -lift, duration: hop / 2, ease: "power2.out" }, i * hop)
        .to(
          body,
          { y: 0, duration: hop / 2, ease: "power2.in" },
          i * hop + hop / 2,
        )
        .to(
          shadow,
          { scale: 0.5, opacity: 0.35, duration: hop / 2, ease: "power2.out" },
          i * hop,
        )
        .to(
          shadow,
          { scale: 1, opacity: 1, duration: hop / 2, ease: "power2.in" },
          i * hop + hop / 2,
        );
    }
    roll.set(weed, { autoAlpha: 0 });
  };

  launch(gsap.utils.random(3, 6));

  const unsubscribe = subscribeAmbientPause((paused) => {
    if (paused) roll?.pause();
    else roll?.resume();
  });

  return () => {
    unsubscribe();
    roll?.kill();
    gsap.set([weed, body, shadow], { clearProps: "all" });
  };
}

function followPointer(root: HTMLElement) {
  const layers = gsap.utils
    .toArray<HTMLElement>("[data-depth]", root)
    .map((el) => {
      const depth = Number(el.dataset.depth) || 0;
      return {
        el,
        depth,
        x: gsap.quickTo(el, "x", { duration: 1.4, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 1.4, ease: "power3" }),
      };
    });

  const onPointerMove = (event: PointerEvent) => {
    if (isAmbientPaused()) return;
    const nx = event.clientX / window.innerWidth - 0.5;
    const ny = event.clientY / window.innerHeight - 0.5;
    for (const layer of layers) {
      layer.x(-nx * layer.depth * 40);
      layer.y(-ny * layer.depth * 18);
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    for (const layer of layers) {
      layer.x.tween.kill();
      layer.y.tween.kill();
    }
    gsap.set(
      layers.map((layer) => layer.el),
      { clearProps: "transform" },
    );
  };
}

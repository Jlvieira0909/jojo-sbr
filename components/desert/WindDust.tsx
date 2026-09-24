"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import { subscribeWind, windAt } from "@/lib/wind";
import styles from "./WindDust.module.css";

gsap.registerPlugin(useGSAP);

type Grain = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  phase: number;
};

export function WindDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      let width = 0;
      let height = 0;
      const grains: Grain[] = [];

      const spawn = (grain: Partial<Grain> = {}, anywhere = false): Grain =>
        Object.assign(grain, {
          x: anywhere ? Math.random() * width : -Math.random() * 80,
          y: height * (0.25 + 0.75 * Math.random() ** 0.6),
          size: gsap.utils.random(0.5, 1.8),
          alpha: gsap.utils.random(0.12, 0.4),
          speed: gsap.utils.random(0.55, 1.45),
          phase: Math.random() * Math.PI * 2,
        });

      const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        const target = Math.round(
          gsap.utils.clamp(30, 110, (width * height) / 18000),
        );
        while (grains.length < target) grains.push(spawn({}, true));
        grains.length = target;
      };
      resize();
      window.addEventListener("resize", resize);

      const unsubscribe = subscribeWind((time, delta) => {
        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = "round";
        ctx.strokeStyle = "#f4c88c";

        for (const grain of grains) {
          const wind = windAt(time, grain.x / width);
          const vx = (24 + wind * 640) * grain.speed;
          const vy = Math.sin(time * 1.6 + grain.phase) * 14 - wind * 18;
          grain.x += vx * delta;
          grain.y += vy * delta;
          if (grain.x > width + 40 || grain.y < -20 || grain.y > height + 20)
            spawn(grain);

          const trail = Math.min(vx * 0.03, 18);
          ctx.globalAlpha = Math.min(grain.alpha * (0.25 + wind * 0.9), 1);
          ctx.lineWidth = grain.size;
          ctx.beginPath();
          ctx.moveTo(grain.x - trail, grain.y + vy * 0.02);
          ctx.lineTo(grain.x, grain.y);
          ctx.stroke();
        }
      });

      return () => {
        unsubscribe();
        window.removeEventListener("resize", resize);
        ctx.clearRect(0, 0, width, height);
      };
    });

    return () => mm.revert();
  });

  return <canvas ref={canvasRef} className={styles.dust} aria-hidden />;
}

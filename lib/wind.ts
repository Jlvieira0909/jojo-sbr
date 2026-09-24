import { gsap } from "gsap";
import { createRandom } from "./random";

const BREEZE = 0.16;
const GUST_CROSSING = 0.9;

const permutation = (() => {
  const random = createRandom(1890);
  const values = Array.from({ length: 256 }, (_, i) => i);
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
})();

function noise(x: number) {
  const i = Math.floor(x);
  const f = x - i;
  const a = (permutation[i & 255] / 127.5 - 1) * f;
  const b = (permutation[(i + 1) & 255] / 127.5 - 1) * (f - 1);
  const fade = f * f * f * (f * (f * 6 - 15) + 10);
  return 2 * (a + (b - a) * fade);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

export const windControl = { intensity: 0 };

export function windAt(time: number, x = 0) {
  const t = time - x * GUST_CROSSING;
  const gust = smoothstep(
    0.02,
    0.38,
    noise(t * 0.13) * 0.7 + noise(t * 0.41 + 11.7) * 0.3,
  );
  const turbulence = noise(t * 1.3 + 43.1) * 0.06;
  const strength = BREEZE + gust * (1 - BREEZE) + turbulence;
  return Math.min(Math.max(strength, 0), 1) * windControl.intensity;
}

type WindListener = (time: number, delta: number) => void;
type PauseListener = (paused: boolean) => void;

const listeners = new Set<WindListener>();
const pauseListeners = new Set<PauseListener>();
let clock = 18;
let paused = false;

function tick(_time: number, deltaMs: number) {
  if (paused) return;
  const delta = deltaMs / 1000;
  clock += delta;
  for (const listener of listeners) listener(clock, delta);
}

export function subscribeWind(listener: WindListener) {
  if (listeners.size === 0) gsap.ticker.add(tick);
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) gsap.ticker.remove(tick);
  };
}

export function setAmbientPaused(value: boolean) {
  if (paused === value) return;
  paused = value;
  for (const listener of pauseListeners) listener(value);
}

export function isAmbientPaused() {
  return paused;
}

export function subscribeAmbientPause(listener: PauseListener) {
  pauseListeners.add(listener);
  return () => {
    pauseListeners.delete(listener);
  };
}

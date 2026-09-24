import { createRandom } from "./random";

type Point = readonly [number, number];

type RidgeOptions = {
  width: number;
  height: number;
  base: number;
  amplitude: number;
  seed: number;
  roughness?: number;
  detail?: number;
  smooth?: boolean;
};

const round = (value: number) => Math.round(value * 10) / 10;

export function ridge({
  width,
  height,
  base,
  amplitude,
  seed,
  roughness = 0.5,
  detail = 7,
  smooth = false,
}: RidgeOptions) {
  const random = createRandom(seed);
  const count = 2 ** detail;
  const offsets = new Array<number>(count + 1).fill(0);

  let spread = amplitude;
  for (let step = count; step > 1; step /= 2) {
    const half = step / 2;
    for (let i = half; i < count; i += step) {
      const middle = (offsets[i - half] + offsets[i + half]) / 2;
      offsets[i] = middle + (random() * 2 - 1) * spread;
    }
    spread *= roughness;
  }

  const points: Point[] = offsets.map((offset, i) => [
    round((i / count) * width),
    round(height - Math.max(base + offset, 2)),
  ]);

  let crest = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!smooth) {
      crest += `L${p2[0]} ${p2[1]}`;
      continue;
    }
    const p0 = points[i - 1] ?? p1;
    const p3 = points[i + 2] ?? p2;
    const c1 = [
      round(p1[0] + (p2[0] - p0[0]) / 6),
      round(p1[1] + (p2[1] - p0[1]) / 6),
    ];
    const c2 = [
      round(p2[0] - (p3[0] - p1[0]) / 6),
      round(p2[1] - (p3[1] - p1[1]) / 6),
    ];
    crest += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }

  const area = `M0 ${height}L${crest.slice(1)}L${width} ${height}Z`;
  return { area, crest };
}

type ScatterOptions = {
  count: number;
  seed: number;
  x: [number, number];
  y: [number, number];
  size: [number, number];
};

export function scatter({ count, seed, x, y, size }: ScatterOptions) {
  const random = createRandom(seed);
  return Array.from({ length: count }, () => {
    const depth = random() ** 1.6;
    return {
      x: round(x[0] + random() * (x[1] - x[0])),
      y: round(y[0] + depth * (y[1] - y[0])),
      size: round(
        size[0] + depth * (size[1] - size[0]) * (0.6 + random() * 0.8),
      ),
      variant: random(),
    };
  });
}

export function tumbleweedPath(seed: number, radius = 44, strands = 34) {
  const random = createRandom(seed);
  const polar = (angle: number, distance: number) =>
    `${round(Math.cos(angle) * distance)} ${round(Math.sin(angle) * distance)}`;

  let d = "";
  for (let i = 0; i < strands; i++) {
    const start = random() * Math.PI * 2;
    const sweep = (random() - 0.5) * Math.PI * 1.6;
    const r1 = radius * (0.35 + random() * 0.65);
    const r2 = radius * (0.35 + random() * 0.65);
    const bend = radius * (random() * 1.1);
    d += `M${polar(start, r1)}Q${polar(start + sweep / 2 + (random() - 0.5), bend)} ${polar(start + sweep, r2)}`;
  }
  return d;
}

import type { CSSProperties } from "react";
import { ridge, scatter, tumbleweedPath } from "@/lib/terrain";
import styles from "./DesertBackdrop.module.css";

const FAR_RANGE = ridge({
  width: 3840,
  height: 420,
  base: 170,
  amplitude: 150,
  seed: 7,
  roughness: 0.52,
});
const NEAR_RANGE = ridge({
  width: 3840,
  height: 420,
  base: 70,
  amplitude: 70,
  seed: 23,
});

const DUNES = [
  ridge({
    width: 1920,
    height: 420,
    base: 350,
    amplitude: 22,
    seed: 3,
    detail: 4,
    smooth: true,
  }),
  ridge({
    width: 1920,
    height: 420,
    base: 262,
    amplitude: 36,
    seed: 5,
    detail: 4,
    smooth: true,
  }),
  ridge({
    width: 1920,
    height: 420,
    base: 150,
    amplitude: 48,
    seed: 9,
    detail: 3,
    smooth: true,
  }),
];

const SHRUBS = scatter({
  count: 80,
  seed: 42,
  x: [0, 1920],
  y: [16, 410],
  size: [2.5, 15],
});

const TUMBLEWEED = tumbleweedPath(11);

const CLOUD_SHAPES = {
  streak: {
    viewBox: "0 0 600 100",
    d: "M10 78C30 60 70 58 96 66C112 44 160 40 186 56C210 38 262 34 290 52C320 40 372 42 392 60C420 50 470 52 492 64C530 60 570 66 590 80C594 88 584 92 570 92L26 92C12 92 4 86 10 78Z",
  },
  puff: {
    viewBox: "0 0 320 100",
    d: "M20 80C24 62 50 54 72 60C82 36 130 28 156 48C172 30 222 30 236 52C262 46 292 56 296 74C306 84 296 92 280 92L34 92C20 92 14 88 20 80Z",
  },
  wisp: {
    viewBox: "0 0 600 90",
    d: "M0 60C80 52 160 46 260 48C360 50 460 54 590 64C520 72 420 74 300 74C180 74 80 72 0 60Z",
  },
} as const;

type Cloud = {
  shape: keyof typeof CLOUD_SHAPES;
  x: string;
  y: string;
  width: string;
  opacity: number;
  speed: number;
  tone: "high" | "low";
};

const CLOUDS: Cloud[] = [
  {
    shape: "streak",
    x: "-6%",
    y: "4%",
    width: "42vw",
    opacity: 0.95,
    speed: 7,
    tone: "high",
  },
  {
    shape: "wisp",
    x: "48%",
    y: "10%",
    width: "50vw",
    opacity: 0.7,
    speed: 5,
    tone: "high",
  },
  {
    shape: "puff",
    x: "70%",
    y: "20%",
    width: "22vw",
    opacity: 0.9,
    speed: 10,
    tone: "high",
  },
  {
    shape: "streak",
    x: "8%",
    y: "27%",
    width: "34vw",
    opacity: 0.85,
    speed: 12,
    tone: "low",
  },
  {
    shape: "wisp",
    x: "58%",
    y: "38%",
    width: "40vw",
    opacity: 0.75,
    speed: 9,
    tone: "low",
  },
  {
    shape: "puff",
    x: "-2%",
    y: "44%",
    width: "18vw",
    opacity: 0.8,
    speed: 14,
    tone: "low",
  },
  {
    shape: "wisp",
    x: "30%",
    y: "50%",
    width: "36vw",
    opacity: 0.55,
    speed: 11,
    tone: "low",
  },
];

type Arm = {
  at: number;
  side: 1 | -1;
  reach: number;
  rise: number;
  width: number;
};

type SaguaroProps = {
  x: number;
  y: number;
  height: number;
  width: number;
  arms: Arm[];
  tone: "near" | "far";
};

function Saguaro({ x, y, height, width, arms, tone }: SaguaroProps) {
  const trunk = `M${x} ${y}V${y - height + width / 2}`;
  const armPaths = arms.map(({ at, side, reach, rise }) => {
    const sy = y - at;
    const elbow = x + side * reach;
    const radius = Math.min(reach * 0.55, 22);
    return `M${x} ${sy}H${elbow - side * radius}Q${elbow} ${sy} ${elbow} ${sy - radius}V${sy - rise}`;
  });
  const cls = tone === "near" ? styles.cactusNear : styles.cactusFar;

  return (
    <g className={cls} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g
        className={styles.cactusRim}
        transform={`translate(${width * 0.13} ${-width * 0.04})`}
      >
        <path d={trunk} strokeWidth={width} />
        {armPaths.map((d, i) => (
          <path key={i} d={d} strokeWidth={arms[i].width} />
        ))}
      </g>
      <g className={styles.cactusBody}>
        <path d={trunk} strokeWidth={width} />
        {armPaths.map((d, i) => (
          <path key={i} d={d} strokeWidth={arms[i].width} />
        ))}
      </g>
      {tone === "near" && (
        <g className={styles.cactusRibs}>
          <path d={`M${x - width * 0.2} ${y}V${y - height + width}`} />
          <path d={`M${x + width * 0.16} ${y}V${y - height + width}`} />
        </g>
      )}
    </g>
  );
}

function GrassTuft({ x, y, size }: { x: number; y: number; size: number }) {
  const blades = [-0.9, -0.5, -0.15, 0.2, 0.55, 0.95];
  return (
    <g className={styles.grass}>
      {blades.map((lean, i) => (
        <path
          key={i}
          d={`M${x + lean * size * 0.25} ${y}Q${x + lean * size * 0.5} ${y - size * 0.6} ${x + lean * size} ${y - size * (0.75 + (i % 2) * 0.3)}`}
        />
      ))}
    </g>
  );
}

export function DesertBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden>
      <svg className={styles.defs} width="0" height="0" focusable="false">
        <defs>
          <linearGradient id="sbr-cloud-high" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4b1a34" />
            <stop offset="0.55" stopColor="#8a2c34" />
            <stop offset="1" stopColor="#e5763c" />
          </linearGradient>
          <linearGradient id="sbr-cloud-low" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9c3a2f" />
            <stop offset="0.6" stopColor="#dc6b33" />
            <stop offset="1" stopColor="#ffc777" />
          </linearGradient>
          <linearGradient id="sbr-range-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbe4b0" />
            <stop offset="1" stopColor="#efbd78" />
          </linearGradient>
          <linearGradient id="sbr-range-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e7a864" />
            <stop offset="1" stopColor="#d58b4b" />
          </linearGradient>
          <linearGradient id="sbr-mesa" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7a2f1e" />
            <stop offset="0.6" stopColor="#a8472a" />
            <stop offset="1" stopColor="#cf6a3b" />
          </linearGradient>
          <linearGradient id="sbr-mesa-far" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c0673f" />
            <stop offset="1" stopColor="#de8d56" />
          </linearGradient>
          <filter id="sbr-soft" x="-5%" y="-20%" width="110%" height="140%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>
      </svg>

      <div className={styles.sky} />

      <div className={styles.sunLayer} data-depth="1">
        <div className={styles.sun} />
      </div>

      <div className={styles.clouds} data-depth="0.85">
        {CLOUDS.map((cloud, i) => {
          const shape = CLOUD_SHAPES[cloud.shape];
          return (
            <div
              key={i}
              className={styles.cloud}
              data-cloud
              data-speed={cloud.speed}
              style={
                {
                  "--x": cloud.x,
                  "--y": cloud.y,
                  "--w": cloud.width,
                  aspectRatio: shape.viewBox.split(" ").slice(2).join(" / "),
                  opacity: cloud.opacity,
                } as CSSProperties
              }
            >
              <svg viewBox={shape.viewBox} preserveAspectRatio="none">
                <path
                  d={shape.d}
                  fill={`url(#sbr-cloud-${cloud.tone})`}
                  filter="url(#sbr-soft)"
                />
              </svg>
            </div>
          );
        })}
      </div>

      <div className={styles.range} data-depth="0.6">
        <svg viewBox="0 0 3840 420" preserveAspectRatio="xMidYMax slice">
          <path d={FAR_RANGE.area} fill="url(#sbr-range-far)" />
          <path d={FAR_RANGE.crest} className={styles.rangeCrest} />
          <path d={NEAR_RANGE.area} fill="url(#sbr-range-near)" />
        </svg>
      </div>

      <div className={`${styles.mesas} ${styles.mesasLeft}`} data-depth="0.45">
        <svg viewBox="0 0 900 300" preserveAspectRatio="xMinYMax meet">
          <path
            d="M90 300L120 280L146 266L150 226L156 222L230 220L240 226L246 262L276 282L300 300Z"
            fill="url(#sbr-mesa-far)"
          />
          <path
            d="M380 300L410 262L436 236L448 214L452 128L458 122L520 118L590 120L658 116L666 124L672 210L690 234L726 262L760 300Z"
            fill="url(#sbr-mesa)"
          />
          <path
            d="M658 116L666 124L672 210L690 234L726 262L760 300"
            className={styles.mesaRim}
          />
          <path
            d="M790 300L818 270L830 250L836 160L842 150L860 148L868 156L872 240L890 268L900 300Z"
            fill="url(#sbr-mesa)"
          />
          <path
            d="M860 148L868 156L872 240L890 268L900 300"
            className={styles.mesaRim}
          />
        </svg>
      </div>

      <div className={`${styles.mesas} ${styles.mesasRight}`} data-depth="0.45">
        <svg viewBox="0 0 900 300" preserveAspectRatio="xMaxYMax meet">
          <path
            d="M90 300L120 282L146 268L150 230L156 226L236 224L246 230L252 264L282 284L306 300Z"
            fill="url(#sbr-mesa-far)"
          />
          <path
            d="M330 300L352 276L362 256L368 186L374 178L388 176L394 184L398 250L410 274L424 300Z"
            fill="url(#sbr-mesa)"
          />
          <path
            d="M388 176L394 184L398 250L410 274L424 300"
            className={styles.mesaRim}
          />
          <path
            d="M470 300L505 268L540 248L548 150L556 142L640 138L720 141L790 136L800 146L806 236L840 262L880 286L900 300Z"
            fill="url(#sbr-mesa)"
          />
          <path
            d="M790 136L800 146L806 236L840 262L880 286L900 300"
            className={styles.mesaRim}
          />
        </svg>
      </div>

      <div className={styles.haze} />

      <div className={styles.ground} data-depth="0.2">
        <svg viewBox="0 0 1920 420" preserveAspectRatio="xMidYMin slice">
          {DUNES.map((dune, i) => (
            <g key={i} className={styles.dune} data-band={i}>
              <path d={dune.area} />
              <path d={dune.crest} className={styles.duneCrest} />
            </g>
          ))}
          {SHRUBS.map((shrub, i) =>
            shrub.variant > 0.78 ? (
              <path
                key={i}
                className={styles.pebble}
                d={`M${shrub.x - shrub.size} ${shrub.y}Q${shrub.x - shrub.size * 0.6} ${shrub.y - shrub.size * 0.9} ${shrub.x} ${shrub.y - shrub.size * 0.8}Q${shrub.x + shrub.size} ${shrub.y - shrub.size * 0.7} ${shrub.x + shrub.size} ${shrub.y}Z`}
              />
            ) : (
              <g key={i} className={styles.shrub}>
                <ellipse
                  cx={shrub.x + shrub.size * 0.5}
                  cy={shrub.y}
                  rx={shrub.size * 1.4}
                  ry={shrub.size * 0.28}
                />
                <ellipse
                  cx={shrub.x}
                  cy={shrub.y - shrub.size * 0.35}
                  rx={shrub.size}
                  ry={shrub.size * 0.55}
                />
              </g>
            ),
          )}
        </svg>
      </div>

      <div className={`${styles.props} ${styles.propsLeft}`} data-depth="0.12">
        <svg viewBox="0 0 600 600" preserveAspectRatio="xMinYMax meet">
          <Saguaro
            x={70}
            y={312}
            height={116}
            width={15}
            tone="far"
            arms={[{ at: 52, side: 1, reach: 17, rise: 36, width: 10 }]}
          />
          <path
            className={styles.rockFar}
            d="M34 314L44 302L62 298L76 306L82 314Z"
          />
          <GrassTuft x={100} y={316} size={12} />

          <Saguaro
            x={262}
            y={604}
            height={452}
            width={50}
            tone="near"
            arms={[
              { at: 196, side: -1, reach: 64, rise: 118, width: 32 },
              { at: 262, side: 1, reach: 58, rise: 112, width: 30 },
            ]}
          />
          <g className={styles.rock}>
            <path d="M182 604L196 572L226 556L262 560L280 578L288 604Z" />
            <path
              className={styles.rockLit}
              d="M196 572L226 556L262 560L280 578L252 574L218 570Z"
            />
            <path d="M280 604L296 584L324 578L348 590L356 604Z" />
            <path
              className={styles.rockLit}
              d="M296 584L324 578L348 590L330 588Z"
            />
          </g>
          <GrassTuft x={342} y={600} size={30} />

          <g className={styles.signpost}>
            <path
              className={styles.signPost}
              d="M140 604L143 402L157 402L160 604Z"
            />
            <g transform="translate(150 440) rotate(-4)">
              <path
                className={styles.signBoard}
                d="M-14 -21H132L156 0L132 21H-14Z"
              />
              <path className={styles.signEdge} d="M-14 -21H132L156 0" />
              <text
                className={styles.signText}
                x="68"
                y="7.5"
                textAnchor="middle"
              >
                NEW YORK
              </text>
            </g>
            <g transform="translate(150 490) rotate(5)">
              <path
                className={styles.signBoard}
                d="M14 -18H-104L-126 0L-104 18H14Z"
              />
              <path className={styles.signEdge} d="M14 -18H-104L-126 0" />
              <text
                className={`${styles.signText} ${styles.signTextSmall}`}
                x="-58"
                y="5.5"
                textAnchor="middle"
              >
                SAN DIEGO
              </text>
            </g>
            <circle className={styles.signNail} cx="150" cy="440" r="3" />
            <circle className={styles.signNail} cx="150" cy="490" r="3" />
          </g>
          <GrassTuft x={132} y={604} size={24} />
          <GrassTuft x={172} y={602} size={20} />
        </svg>
      </div>

      <div className={`${styles.props} ${styles.propsRight}`} data-depth="0.12">
        <svg viewBox="0 0 600 600" preserveAspectRatio="xMaxYMax meet">
          <Saguaro
            x={236}
            y={320}
            height={96}
            width={13}
            tone="far"
            arms={[{ at: 40, side: -1, reach: 14, rise: 30, width: 9 }]}
          />
          <GrassTuft x={214} y={322} size={10} />

          <Saguaro
            x={372}
            y={604}
            height={336}
            width={42}
            tone="near"
            arms={[
              { at: 150, side: -1, reach: 52, rise: 100, width: 28 },
              { at: 204, side: 1, reach: 48, rise: 92, width: 26 },
            ]}
          />
          <g className={styles.deadBush}>
            <path d="M520 604C516 560 506 530 486 500" />
            <path d="M520 604C526 556 544 520 574 494" />
            <path d="M521 604C520 548 522 506 528 462" />
            <path d="M506 540C490 530 474 528 458 532" />
            <path d="M497 516C492 496 494 478 500 462" />
            <path d="M540 536C556 520 572 516 590 518" />
            <path d="M556 512C560 494 568 480 580 470" />
            <path d="M525 492C512 480 506 468 506 452" />
            <path d="M526 480C538 470 548 458 552 444" />
            <path d="M486 500C476 494 466 494 456 498" />
            <path d="M574 494C584 488 594 488 600 490" />
          </g>
          <g className={styles.rock}>
            <path d="M300 604L318 580L352 568L392 572L416 588L424 604Z" />
            <path
              className={styles.rockLit}
              d="M318 580L352 568L392 572L416 588L384 584L344 582Z"
            />
            <path d="M440 604L452 590L474 586L490 596L494 604Z" />
          </g>
          <GrassTuft x={292} y={602} size={26} />
          <GrassTuft x={560} y={604} size={20} />
        </svg>
      </div>

      <div className={styles.tumbleweed} data-tumbleweed>
        <span className={styles.tumbleweedShadow} data-tumbleweed-shadow />
        <span className={styles.tumbleweedBody} data-tumbleweed-body>
          <svg viewBox="-50 -50 100 100">
            <path d={TUMBLEWEED} className={styles.tumbleweedStrands} />
            <circle r="30" className={styles.tumbleweedCore} />
          </svg>
        </span>
      </div>
    </div>
  );
}

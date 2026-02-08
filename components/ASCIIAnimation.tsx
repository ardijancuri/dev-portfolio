"use client";

import { useEffect, useRef, useState } from "react";

// Monospace chars are ~2x taller than wide, so double cols for square appearance
const SIZE = 22;
const COLS = SIZE * 2;
const ROWS = SIZE;
const CHARS = "01{}()<>[];:=+-%#@!&|/\\*.~$^";

function createEmptyGrid(): string[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => " ")
  );
}

// Scene 1: Code typing (first on page load)
function codeTypingScene(tick: number): string[] {
  const lines = [
    "",
    "  const life = async () => {",
    "",
    "    <build />",
    "    <deploy />",
    "    <ship />",
    "",
    "    while (true) {",
    "      create();",
    "      iterate();",
    "      improve();",
    "      ship();",
    "    }",
    "",
    "    // never stop building",
    "    return Infinity;",
    "  };",
    "",
    "",
    "",
    "",
    "",
  ];

  const result: string[] = [];
  let charCount = 0;
  const charsPerTick = 3;

  for (let i = 0; i < ROWS; i++) {
    if (i < lines.length) {
      const line = lines[i];
      const visibleChars = Math.max(0, tick * charsPerTick - charCount);
      const visible = line.slice(0, visibleChars);
      charCount += line.length;

      if (visibleChars > 0 && visibleChars < line.length) {
        result.push((visible + "_").padEnd(COLS));
      } else {
        result.push(visible.padEnd(COLS));
      }
    } else {
      result.push(" ".repeat(COLS));
    }
  }

  return result;
}

// Scene 2: Matrix rain
function matrixScene(tick: number): string[] {
  const grid = createEmptyGrid();
  const dropCount = 24;

  for (let d = 0; d < dropCount; d++) {
    const col = (d * 7 + d * d * 3) % COLS;
    const speed = (d % 3) + 1;
    const head = (tick * speed + d * 4) % (ROWS + 10);

    for (let row = 0; row < ROWS; row++) {
      const dist = head - row;
      if (dist >= 0 && dist < 7) {
        const ci = (tick + row + col) % CHARS.length;
        grid[row][col] = CHARS[ci];
      }
    }
  }

  return grid.map((row) => row.join(""));
}

// Geometry helpers: each returns an "edge distance" for a pixel
// Circle: single pulsing ring
function circleEdgeDist(dx: number, dy: number, tick: number): number {
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = Math.sin(tick * 0.15) * 2 + 7;
  return Math.abs(dist - radius);
}

// Ripples: concentric wave rings
function ripplesEdgeDist(dx: number, dy: number, tick: number): number {
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 10) return 99;
  const wave = Math.sin(dist * 1.2 - tick * 0.25) * 0.5 + 0.5;
  return wave > 0.55 ? (1 - wave) * 3 : 99;
}

// Star: 5-pointed morphing star outline
function starEdgeDist(dx: number, dy: number, tick: number): number {
  const dist = Math.sqrt(dx * dx + dy * dy);
  const points = 5;
  const outerR = Math.sin(tick * 0.1) * 1.5 + 8;
  const innerR = Math.sin(tick * 0.15 + 1) * 1.5 + 3.5;
  const rotation = tick * 0.04;
  const angle = Math.atan2(dy, dx) + rotation;
  const sector = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const slice = (Math.PI * 2) / points;
  const half = slice / 2;
  const inSlice = sector % slice;
  const t = inSlice < half ? inSlice / half : (slice - inSlice) / half;
  const edgeR = innerR + (outerR - innerR) * t;
  return Math.abs(dist - edgeR);
}

// Scene 3: Morphing shapes (circle → ripples → star with smooth transitions)
function morphingScene(tick: number): string[] {
  const grid = createEmptyGrid();
  const cx = COLS / 2;
  const cy = ROWS / 2;
  const chars = ".:+*#@";

  // 3 shapes, each shown for 50 ticks with 15-tick transition between them
  const shapeDuration = 50;
  const transitionLen = 15;
  const totalCycle = shapeDuration * 3;
  const t = tick % totalCycle;
  const shapeIndex = Math.floor(t / shapeDuration);
  const inShape = t % shapeDuration;

  // Blend factor: 0 = current shape, 1 = next shape
  let blend = 0;
  if (inShape >= shapeDuration - transitionLen) {
    blend = (inShape - (shapeDuration - transitionLen)) / transitionLen;
    // Smooth easing
    blend = blend * blend * (3 - 2 * blend);
  }

  const shapeFns = [circleEdgeDist, ripplesEdgeDist, starEdgeDist];
  const currentFn = shapeFns[shapeIndex % 3];
  const nextFn = shapeFns[(shapeIndex + 1) % 3];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const dx = (x - cx) / 2;
      const dy = y - cy;

      const edgeCurrent = currentFn(dx, dy, tick);
      const edgeNext = nextFn(dx, dy, tick);
      const edge = edgeCurrent * (1 - blend) + edgeNext * blend;

      if (edge < 1.8) {
        const ci = Math.floor(((1.8 - edge) / 1.8) * (chars.length - 1));
        grid[y][x] = chars[Math.max(0, ci)];
      }
    }
  }

  return grid.map((row) => row.join(""));
}

type SceneFn = (tick: number) => string[];

const scenes: { fn: SceneFn; duration: number; speed: number }[] = [
  { fn: codeTypingScene, duration: 80, speed: 60 },
  { fn: matrixScene, duration: 60, speed: 100 },
  { fn: morphingScene, duration: 150, speed: 80 },
];

export default function ASCIIAnimation() {
  const [lines, setLines] = useState<string[]>(() => Array(ROWS).fill(" ".repeat(COLS)));
  const sceneRef = useRef(0);
  const tickRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const animate = (time: number) => {
      const scene = scenes[sceneRef.current];
      const elapsed = time - lastTimeRef.current;

      if (elapsed >= scene.speed) {
        lastTimeRef.current = time;
        tickRef.current++;

        const frame = scene.fn(tickRef.current);
        setLines(frame);

        if (tickRef.current >= scene.duration) {
          tickRef.current = 0;
          sceneRef.current = (sceneRef.current + 1) % scenes.length;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="select-none w-full max-w-md md:max-w-lg lg:max-w-xl" aria-hidden="true">
      <pre className="font-mono text-[8px] sm:text-[10px] md:text-xs lg:text-sm leading-[1.2] text-zinc-400 dark:text-zinc-600 whitespace-pre h-full flex items-center justify-center">
        {lines.join("\n")}
      </pre>
    </div>
  );
}

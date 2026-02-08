"use client";

import { useEffect, useRef } from "react";

// ASCII art of Oninova logo — rasterized from SVG path with supersampling
const LOGO_LINES = [
  "                                                        #   ",
  "                                                     ###    ",
  "                                                   ###      ",
  "                                                 ####       ",
  "                                               #####        ",
  "                                             ######         ",
  "                                           #######          ",
  "                                         #########          ",
  "                                      ############          ",
  "  #                                 #############           ",
  "   ##                             ###############           ",
  "     ###                        ##################          ",
  "      #####                  #####################          ",
  "       #########       ############################         ",
  "        ############################################        ",
  "         ###########################        #########       ",
  "          #####################                  #####      ",
  "          ##################                        ####    ",
  "           ###############                             ##   ",
  "           #############                                 #  ",
  "          ############                                      ",
  "          #########                                         ",
  "         ########                                           ",
  "         ######                                             ",
  "        #####                                               ",
  "       ####                                                 ",
  "     ####                                                   ",
  "    ##                                                      ",
  "  ##                                                        ",
];

const SHIMMER_CHARS = "01{}()<>[];:=+-%#@!&|/*.~$^";
const DEPTH_CHARS = "@%#*+=:-.";

// 3D rotation configuration
const ROTATION_SPEED = 0.03;   // Continuous rotation speed
const TRANSITION_TICKS = 30;

// Pre-compute filled cell positions and logo center
const filledCells: [number, number][] = [];
let sumRow = 0, sumCol = 0;
LOGO_LINES.forEach((line, row) => {
  for (let col = 0; col < line.length; col++) {
    if (line[col] !== " ") {
      filledCells.push([row, col]);
      sumRow += row;
      sumCol += col;
    }
  }
});
const totalFilledChars = filledCells.length;
const centerRow = sumRow / totalFilledChars;
const centerCol = sumCol / totalFilledChars;

// Sort filled cells by distance from center (for radial reveal)
const filledCellsByDist = [...filledCells].sort((a, b) => {
  const da = (a[0] - centerRow) ** 2 + ((a[1] - centerCol) / 2) ** 2;
  const db = (b[0] - centerRow) ** 2 + ((b[1] - centerCol) / 2) ** 2;
  return da - db;
});
// Pre-compute max distance for radius calculation
const maxDist = Math.sqrt(
  (filledCellsByDist[filledCellsByDist.length - 1][0] - centerRow) ** 2 +
  ((filledCellsByDist[filledCellsByDist.length - 1][1] - centerCol) / 2) ** 2
);

// Pre-compute fast lookup grid and row bounds
const GRID_ROWS = LOGO_LINES.length;
const GRID_COLS = Math.max(...LOGO_LINES.map(l => l.length));
const isFilledGrid: boolean[][] = LOGO_LINES.map(line => {
  const row = new Array(GRID_COLS).fill(false);
  for (let col = 0; col < line.length; col++) {
    if (line[col] !== " ") row[col] = true;
  }
  return row;
});
const rowBounds: [number, number][] = LOGO_LINES.map(line => {
  let min = GRID_COLS, max = -1;
  for (let col = 0; col < line.length; col++) {
    if (line[col] !== " ") {
      min = Math.min(min, col);
      max = Math.max(max, col);
    }
  }
  return [min, max];
});

// Compute bounding box center for mirroring (not center of mass)
let globalMinCol = GRID_COLS, globalMaxCol = -1;
for (const [min, max] of rowBounds) {
  if (min <= max) {
    globalMinCol = Math.min(globalMinCol, min);
    globalMaxCol = Math.max(globalMaxCol, max);
  }
}
const mirrorAxis = (globalMinCol + globalMaxCol) / 2;

// Pre-compute mirrored grid (horizontally flipped around bounding box center)
const isFilledGridBack: boolean[][] = Array.from({ length: GRID_ROWS }, () =>
  new Array(GRID_COLS).fill(false)
);
for (let r = 0; r < GRID_ROWS; r++) {
  for (let c = 0; c < GRID_COLS; c++) {
    const mirroredSrc = Math.round(2 * mirrorAxis - c);
    if (mirroredSrc >= 0 && mirroredSrc < GRID_COLS) {
      isFilledGridBack[r][c] = isFilledGrid[r][mirroredSrc];
    }
  }
}
const rowBoundsBack: [number, number][] = isFilledGridBack.map(row => {
  let min = GRID_COLS, max = -1;
  for (let col = 0; col < GRID_COLS; col++) {
    if (row[col]) {
      min = Math.min(min, col);
      max = Math.max(max, col);
    }
  }
  return [min, max];
});

function computeRotatedGrid(tick: number): string[][] {
  // Smooth ramp-up of rotation speed
  const transitionProgress = Math.min(1, tick / TRANSITION_TICKS);
  const easedTransition = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);

  // Continuous rotation — angle increases linearly forever
  const rotationAngle = tick * ROTATION_SPEED * easedTransition;
  const cosTheta = Math.cos(rotationAngle);
  const absCos = Math.abs(cosTheta);
  const sinTheta = Math.sin(rotationAngle);

  // When nearly edge-on, show a thin vertical line at the pivot (logo's "edge")
  if (absCos < 0.015) {
    const output = Array.from({ length: GRID_ROWS }, () => new Array(GRID_COLS).fill(" "));
    const pivotCol = Math.round(mirrorAxis);
    for (let row = 0; row < GRID_ROWS; row++) {
      const [minCol, maxCol] = rowBounds[row];
      if (minCol <= maxCol) {
        output[row][pivotCol] = ".";
      }
    }
    return output;
  }

  // When cos < 0 we see the back (mirrored) face
  const isBackSide = cosTheta < 0;
  const grid = isBackSide ? isFilledGridBack : isFilledGrid;
  const bounds = isBackSide ? rowBoundsBack : rowBounds;

  // Use bounding box center as rotation pivot for visual symmetry
  const pivot = mirrorAxis;

  const output: string[][] = Array.from({ length: GRID_ROWS }, () =>
    new Array(GRID_COLS).fill(" ")
  );

  for (let row = 0; row < GRID_ROWS; row++) {
    const [minCol, maxCol] = bounds[row];
    if (minCol > maxCol) continue;

    // Compute screen column range from source bounds
    const s1 = pivot + (minCol - pivot) * absCos;
    const s2 = pivot + (maxCol - pivot) * absCos;
    const colStart = Math.max(0, Math.floor(Math.min(s1, s2)) - 1);
    const colEnd = Math.min(GRID_COLS - 1, Math.ceil(Math.max(s1, s2)) + 1);

    for (let screenCol = colStart; screenCol <= colEnd; screenCol++) {
      const normalizedScreenX = screenCol - pivot;
      const srcColExact = pivot + normalizedScreenX / absCos;

      const srcColLow = Math.floor(srcColExact);
      const srcColHigh = Math.ceil(srcColExact);

      if (srcColLow < 0 || srcColHigh >= GRID_COLS) continue;

      const filledLow = srcColLow >= 0 && srcColLow < GRID_COLS && grid[row][srcColLow];
      const filledHigh = srcColHigh >= 0 && srcColHigh < GRID_COLS && grid[row][srcColHigh];

      if (!filledLow && !filledHigh) continue;

      // Compute depth for character selection
      const srcCol = filledLow && filledHigh ? Math.round(srcColExact) : (filledLow ? srcColLow : srcColHigh);
      const depthZ = (srcColExact - pivot) * sinTheta;
      const normalizedDepth = Math.max(-1, Math.min(1, depthZ / 20));

      // Anti-alias: edge cells get lighter characters
      const isEdge = (filledLow && !filledHigh) || (!filledLow && filledHigh);

      let ch: string;
      if (isEdge) {
        ch = ".";
      } else {
        const depthIndex = Math.floor((normalizedDepth + 1) / 2 * (DEPTH_CHARS.length - 1));
        ch = DEPTH_CHARS[Math.max(0, Math.min(depthIndex, DEPTH_CHARS.length - 1))];
      }

      // Subtle shimmer overlay
      const shimmerIntensity = 1.0 - easedTransition * 0.7;
      const dr = row - centerRow;
      const dc = (srcCol - centerCol) / 2;
      const dist = Math.sqrt(dr * dr + dc * dc);
      const pulse = Math.sin(dist * 0.8 - tick * 0.35);

      if (pulse * shimmerIntensity > 0.5) {
        const ci = (tick * 7 + row * 13 + srcCol * 31) % SHIMMER_CHARS.length;
        ch = SHIMMER_CHARS[ci];
      }

      output[row][screenCol] = ch;
    }
  }

  return output;
}

export default function ASCIILogo() {
  const ref = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const started = useRef(false);
  const revealCount = useRef(0);
  const rotationTick = useRef(0);
  const phase = useRef<"waiting" | "reveal" | "rotating">("waiting");
  const rafRef = useRef<number | null>(null);
  const lastTime = useRef(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          phase.current = "reveal";
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);

    const animate = (time: number) => {
      if (phase.current === "waiting") {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = time - lastTime.current;

      if (phase.current === "reveal") {
        // Radial reveal at ~25ms intervals
        if (elapsed >= 25) {
          lastTime.current = time;
          revealCount.current += 24;

          const grid = LOGO_LINES.map((line) =>
            line.split("").map(() => " ")
          );
          const count = Math.min(revealCount.current, totalFilledChars);
          for (let i = 0; i < count; i++) {
            const [r, c] = filledCellsByDist[i];
            grid[r][c] = "#";
          }

          if (preRef.current) {
            preRef.current.textContent = grid.map((row) => row.join("")).join("\n");
          }

          if (revealCount.current >= totalFilledChars) {
            phase.current = "rotating";
          }
        }
      } else {
        // Continuous rotation at ~70ms intervals
        if (elapsed >= 70) {
          lastTime.current = time;
          rotationTick.current++;

          const grid = computeRotatedGrid(rotationTick.current);
          if (preRef.current) {
            preRef.current.textContent = grid.map((row) => row.join("")).join("\n");
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={ref} className="select-none w-full flex items-center justify-center overflow-hidden" aria-hidden="true">
      <pre ref={preRef} className="font-mono text-[4px] sm:text-[8px] md:text-[10px] lg:text-xs leading-[1.4] text-zinc-400 dark:text-zinc-600 whitespace-pre" />
    </div>
  );
}

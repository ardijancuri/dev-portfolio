"use client";

import { useEffect, useRef } from "react";

// ASCII art of the Oninova mark, rasterized from the SVG path.
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
const SURFACE_CHARS = "@%#*+=-:.";
const EDGE_CHARS = "%#*+=-:.";
const SIDE_CHARS = "+=-:.";

const ROTATION_SPEED = 0.03;
const TRANSITION_TICKS = 30;
const POINTER_EASE = 0.12;

const GRID_ROWS = LOGO_LINES.length;
const GRID_COLS = Math.max(...LOGO_LINES.map((line) => line.length));
const EMPTY_TEXT = LOGO_LINES.map(() => " ".repeat(GRID_COLS)).join("\n");

const filledCells: [number, number][] = [];
let sumRow = 0;
let sumCol = 0;

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

const filledCellsByDist = [...filledCells].sort((a, b) => {
  const da = (a[0] - centerRow) ** 2 + ((a[1] - centerCol) / 2) ** 2;
  const db = (b[0] - centerRow) ** 2 + ((b[1] - centerCol) / 2) ** 2;
  return da - db;
});

const isFilledGrid: boolean[][] = LOGO_LINES.map((line) => {
  const row = new Array(GRID_COLS).fill(false);
  for (let col = 0; col < line.length; col++) {
    row[col] = line[col] !== " ";
  }
  return row;
});

const rowBounds: [number, number][] = LOGO_LINES.map((line) => {
  let min = GRID_COLS;
  let max = -1;

  for (let col = 0; col < line.length; col++) {
    if (line[col] !== " ") {
      min = Math.min(min, col);
      max = Math.max(max, col);
    }
  }

  return [min, max];
});

let globalMinCol = GRID_COLS;
let globalMaxCol = -1;

for (const [min, max] of rowBounds) {
  if (min <= max) {
    globalMinCol = Math.min(globalMinCol, min);
    globalMaxCol = Math.max(globalMaxCol, max);
  }
}

const mirrorAxis = (globalMinCol + globalMaxCol) / 2;

const isFilledGridBack: boolean[][] = Array.from({ length: GRID_ROWS }, () =>
  new Array(GRID_COLS).fill(false)
);

for (let row = 0; row < GRID_ROWS; row++) {
  for (let col = 0; col < GRID_COLS; col++) {
    const mirroredCol = Math.round(2 * mirrorAxis - col);

    if (mirroredCol >= 0 && mirroredCol < GRID_COLS) {
      isFilledGridBack[row][col] = isFilledGrid[row][mirroredCol];
    }
  }
}

const rowBoundsBack: [number, number][] = isFilledGridBack.map((row) => {
  let min = GRID_COLS;
  let max = -1;

  for (let col = 0; col < GRID_COLS; col++) {
    if (row[col]) {
      min = Math.min(min, col);
      max = Math.max(max, col);
    }
  }

  return [min, max];
});

interface LightState {
  x: number;
  y: number;
  intensity: number;
}

function createGrid() {
  return Array.from({ length: GRID_ROWS }, () =>
    new Array(GRID_COLS).fill(" ")
  );
}

function gridToText(grid: string[][]) {
  return grid.map((row) => row.join("")).join("\n");
}

function isFilled(grid: boolean[][], row: number, col: number) {
  return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS
    ? grid[row][col]
    : false;
}

function pickChar(ramp: string, light: number) {
  const clamped = Math.max(0, Math.min(1, light));
  const index = Math.round((1 - clamped) * (ramp.length - 1));
  return ramp[Math.max(0, Math.min(index, ramp.length - 1))];
}

function bevelLight(grid: boolean[][], row: number, col: number) {
  const leftEmpty = !isFilled(grid, row, col - 1);
  const rightEmpty = !isFilled(grid, row, col + 1);
  const topEmpty = !isFilled(grid, row - 1, col);
  const bottomEmpty = !isFilled(grid, row + 1, col);

  const normalX = (leftEmpty ? -1 : 0) + (rightEmpty ? 1 : 0);
  const normalY = (topEmpty ? -1 : 0) + (bottomEmpty ? 1 : 0);
  const edgeCount =
    Number(leftEmpty) + Number(rightEmpty) + Number(topEmpty) + Number(bottomEmpty);

  return {
    isEdge: edgeCount > 0,
    light: normalX * -0.11 + normalY * -0.16 + Math.min(edgeCount, 2) * 0.035,
  };
}

function createRevealText(count: number) {
  const grid = createGrid();
  const revealed = Math.min(count, totalFilledChars);

  for (let i = 0; i < revealed; i++) {
    const [row, col] = filledCellsByDist[i];
    grid[row][col] = "#";
  }

  return gridToText(grid);
}

function paintIfEmpty(grid: string[][], row: number, col: number, ch: string) {
  if (
    row < 0 ||
    row >= GRID_ROWS ||
    col < 0 ||
    col >= GRID_COLS ||
    ch === " " ||
    grid[row][col] !== " "
  ) {
    return;
  }

  grid[row][col] = ch;
}

function paintAttachedSide(
  output: string[][],
  row: number,
  screenCol: number,
  sideDirection: number,
  depth: number,
  light: number
) {
  for (let step = depth; step >= 1; step--) {
    const sideLight = light - 0.18 - step * 0.08;
    const sideChar = pickChar(SIDE_CHARS, sideLight);
    const sideCol = screenCol + sideDirection * step;
    const sideRow = row + Math.round(step * 0.22);

    paintIfEmpty(output, sideRow, sideCol, sideChar);

    if (step > 1 && (row + screenCol + step) % 2 === 0) {
      paintIfEmpty(
        output,
        sideRow + 1,
        sideCol,
        pickChar(SIDE_CHARS, sideLight - 0.12)
      );
    }
  }
}

function computeRotatedText(tick: number, pointerLight: LightState) {
  const transitionProgress = Math.min(1, tick / TRANSITION_TICKS);
  const transition =
    transitionProgress * transitionProgress * (3 - 2 * transitionProgress);

  const rotationAngle = tick * ROTATION_SPEED * transition;
  const cosTheta = Math.cos(rotationAngle);
  const absCos = Math.abs(cosTheta);
  const sinTheta = Math.sin(rotationAngle);
  const output = createGrid();
  const sideDirection = sinTheta >= 0 ? -1 : 1;
  const attachedDepth = Math.round(Math.abs(sinTheta) * transition * 4);

  if (absCos < 0.018) {
    const pivotCol = Math.round(mirrorAxis);

    for (let row = 0; row < GRID_ROWS; row++) {
      const [minCol, maxCol] = rowBounds[row];
      if (minCol <= maxCol) {
        const rowLight = 0.68 + Math.sin(row * 0.8 + tick * 0.22) * 0.14;
        paintAttachedSide(output, row, pivotCol, sideDirection, 3, rowLight - 0.1);
        output[row][pivotCol] = pickChar(SURFACE_CHARS, rowLight);

        if (row % 3 === 0 && pivotCol + 1 < GRID_COLS) {
          output[row][pivotCol + 1] = pickChar(EDGE_CHARS, rowLight - 0.2);
        }
      }
    }

    return gridToText(output);
  }

  const isBackSide = cosTheta < 0;
  const grid = isBackSide ? isFilledGridBack : isFilledGrid;
  const bounds = isBackSide ? rowBoundsBack : rowBounds;
  const pivot = mirrorAxis;

  for (let row = 0; row < GRID_ROWS; row++) {
    const [minCol, maxCol] = bounds[row];
    if (minCol > maxCol) {
      continue;
    }

    const s1 = pivot + (minCol - pivot) * absCos;
    const s2 = pivot + (maxCol - pivot) * absCos;
    const colStart = Math.max(0, Math.floor(Math.min(s1, s2)) - 1);
    const colEnd = Math.min(GRID_COLS - 1, Math.ceil(Math.max(s1, s2)) + 1);

    for (let screenCol = colStart; screenCol <= colEnd; screenCol++) {
      const normalizedScreenX = screenCol - pivot;
      const srcColExact = pivot + normalizedScreenX / absCos;
      const srcColLow = Math.floor(srcColExact);
      const srcColHigh = Math.ceil(srcColExact);

      if (srcColLow < 0 || srcColHigh >= GRID_COLS) {
        continue;
      }

      const filledLow = grid[row][srcColLow];
      const filledHigh = grid[row][srcColHigh];

      if (!filledLow && !filledHigh) {
        continue;
      }

      const srcCol =
        filledLow && filledHigh
          ? Math.round(srcColExact)
          : filledLow
            ? srcColLow
            : srcColHigh;
      const depthZ = (srcColExact - pivot) * sinTheta;
      const normalizedDepth = Math.max(-1, Math.min(1, depthZ / 22));
      const { isEdge, light: edgeLight } = bevelLight(grid, row, srcCol);
      const surfaceCurve =
        Math.sin((row - centerRow) * 0.28 + normalizedDepth * 1.8) * 0.055;
      const normalizedCol = (srcCol - centerCol) / (GRID_COLS * 0.5);
      const normalizedRow = (row - centerRow) / (GRID_ROWS * 0.5);
      const pointerDistance =
        (normalizedCol - pointerLight.x) ** 2 +
        (normalizedRow - pointerLight.y) ** 2;
      const pointerHighlight =
        Math.max(0, 1 - pointerDistance * 2.6) * pointerLight.intensity * 0.34;
      const glintBand =
        Math.max(
          0,
          1 -
            Math.abs(
              Math.sin(srcCol * 0.18 + row * 0.22 - tick * 0.18)
            ) *
              3.8
        ) *
        0.18 *
        transition;
      const baseLight =
        0.62 +
        normalizedDepth * 0.26 +
        absCos * 0.12 +
        edgeLight +
        surfaceCurve -
        (isBackSide ? 0.1 : 0) +
        pointerHighlight +
        glintBand;

      const shimmerIntensity = 0.7 - transition * 0.52;
      const dr = row - centerRow;
      const dc = (srcCol - centerCol) / 2;
      const dist = Math.sqrt(dr * dr + dc * dc);
      const pulse = Math.sin(dist * 0.72 - tick * 0.32);

      let ch = pickChar(isEdge ? EDGE_CHARS : SURFACE_CHARS, baseLight);

      if (pulse * shimmerIntensity > 0.58) {
        const charIndex =
          (tick * 7 + row * 13 + srcCol * 31) % SHIMMER_CHARS.length;
        ch = SHIMMER_CHARS[charIndex];
      }

      if (glintBand > 0.12 && pointerHighlight < 0.08 && (row + srcCol) % 2 === 0) {
        ch = isEdge ? "*" : "%";
      }

      if (attachedDepth > 0) {
        paintAttachedSide(
          output,
          row,
          screenCol,
          sideDirection,
          attachedDepth,
          baseLight
        );
      }

      output[row][screenCol] = ch;
    }
  }

  return gridToText(output);
}

export default function ASCIILogo() {
  const ref = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const pointerRef = useRef({
    x: 0.25,
    y: -0.2,
    intensity: 0,
    targetX: 0.25,
    targetY: -0.2,
    targetIntensity: 0,
  });
  const started = useRef(false);
  const revealCount = useRef(0);
  const rotationTick = useRef(0);
  const phase = useRef<"waiting" | "reveal" | "rotating">("waiting");
  const rafRef = useRef<number | null>(null);
  const lastTime = useRef(0);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const setText = (text: string) => {
      if (preRef.current) {
        preRef.current.textContent = text;
      }
    };
    const readPointerLight = () => {
      const pointer = pointerRef.current;

      pointer.x += (pointer.targetX - pointer.x) * POINTER_EASE;
      pointer.y += (pointer.targetY - pointer.y) * POINTER_EASE;
      pointer.intensity +=
        (pointer.targetIntensity - pointer.intensity) * POINTER_EASE;

      return {
        x: pointer.x,
        y: pointer.y,
        intensity: pointer.intensity,
      };
    };

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
        if (elapsed >= 25) {
          lastTime.current = time;
          revealCount.current += 24;
          setText(createRevealText(revealCount.current));

          if (revealCount.current >= totalFilledChars) {
            phase.current = "rotating";
          }
        }
      } else if (elapsed >= 70) {
        lastTime.current = time;
        rotationTick.current++;
        setText(computeRotatedText(rotationTick.current, readPointerLight()));
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    setText(EMPTY_TEXT);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const updatePointerLight = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    const pointer = pointerRef.current;

    pointer.targetX = Math.max(-1, Math.min(1, x));
    pointer.targetY = Math.max(-1, Math.min(1, y));
    pointer.targetIntensity = 1;
  };

  const dimPointerLight = () => {
    pointerRef.current.targetIntensity = 0;
  };

  return (
    <div
      ref={ref}
      onPointerMove={updatePointerLight}
      onPointerLeave={dimPointerLight}
      className="flex min-h-[205px] w-full select-none items-center justify-center overflow-hidden sm:min-h-[325px] md:min-h-[410px] lg:min-h-[490px]"
      aria-hidden="true"
    >
      <pre
        ref={preRef}
        className="font-mono text-[5px] leading-[1.4] text-black dark:text-white sm:text-[8px] md:text-[10px] lg:text-xs whitespace-pre"
      >
        {EMPTY_TEXT}
      </pre>
    </div>
  );
}

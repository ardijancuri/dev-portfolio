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
const ROTATION_TICK_MS = 70;
const POINTER_EASE = 0.32;
const POINTER_PUSH_RADIUS = 0.42;
const POINTER_PUSH_COLS = 6;
const POINTER_PUSH_ROWS = 2;
const SHOCKWAVE_DURATION_MS = 1450;
const SHOCKWAVE_MAX_RADIUS = 1.85;
const SHOCKWAVE_WIDTH = 0.14;
const SHOCKWAVE_PUSH_COLS = 7;
const SHOCKWAVE_PUSH_ROWS = 2.4;

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

interface ShockwaveState {
  x: number;
  y: number;
  radius: number;
  width: number;
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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

function deformCell(
  row: number,
  col: number,
  pointerLight: LightState,
  shockwave: ShockwaveState | null
) {
  const normalizedCol = (col - centerCol) / (GRID_COLS * 0.5);
  const normalizedRow = (row - centerRow) / (GRID_ROWS * 0.5);
  let colOffset = 0;
  let rowOffset = 0;
  let force = 0;
  let waveForce = 0;

  if (pointerLight.intensity >= 0.02) {
    const dx = normalizedCol - pointerLight.x;
    const dy = normalizedRow - pointerLight.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < POINTER_PUSH_RADIUS) {
      let directionX = dx;
      let directionY = dy;
      let directionLength = distance;

      if (directionLength < 0.01) {
        directionX = normalizedCol || 0.1;
        directionY = normalizedRow || 0.1;
        directionLength = Math.sqrt(directionX * directionX + directionY * directionY);
      }

      const falloff = 1 - distance / POINTER_PUSH_RADIUS;
      const pointerForce = falloff * falloff * pointerLight.intensity;
      const ripple = 0.86 + Math.sin(falloff * Math.PI) * 0.18;

      colOffset +=
        (directionX / directionLength) * pointerForce * POINTER_PUSH_COLS * ripple;
      rowOffset +=
        (directionY / directionLength) * pointerForce * POINTER_PUSH_ROWS * ripple;
      force = Math.max(force, pointerForce);
    }
  }

  if (shockwave) {
    const dx = normalizedCol - shockwave.x;
    const dy = normalizedRow - shockwave.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ringDistance = Math.abs(distance - shockwave.radius);

    if (ringDistance < shockwave.width && distance > 0.01) {
      const ringFalloff = 1 - ringDistance / shockwave.width;
      waveForce =
        Math.sin(ringFalloff * Math.PI * 0.5) ** 2 * shockwave.intensity;

      colOffset += (dx / distance) * waveForce * SHOCKWAVE_PUSH_COLS;
      rowOffset += (dy / distance) * waveForce * SHOCKWAVE_PUSH_ROWS;
      force = Math.max(force, waveForce);
    }
  }

  const pushedCol = Math.round(col + colOffset);
  const pushedRow = Math.round(row + rowOffset);

  return {
    row: clamp(pushedRow, 0, GRID_ROWS - 1),
    col: clamp(pushedCol, 0, GRID_COLS - 1),
    force,
    waveForce,
  };
}

function computeRotatedText(
  tick: number,
  pointerLight: LightState,
  shockwave: ShockwaveState | null
) {
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

      const deformed = deformCell(row, screenCol, pointerLight, shockwave);

      if (deformed.force > 0.16 && (row + screenCol + tick) % 3 === 0) {
        ch = pickChar(SURFACE_CHARS, Math.min(1, baseLight + deformed.force * 0.32));
      }

      if (deformed.waveForce > 0.12) {
        const shockLight = Math.min(1, baseLight + deformed.waveForce * 0.68);
        ch =
          deformed.waveForce > 0.42 && (row + screenCol + tick) % 4 === 0
            ? SHIMMER_CHARS[(row * 17 + screenCol * 23 + tick) % SHIMMER_CHARS.length]
            : pickChar(SURFACE_CHARS, shockLight);
      }

      if (attachedDepth > 0) {
        paintAttachedSide(
          output,
          deformed.row,
          deformed.col,
          sideDirection,
          attachedDepth,
          baseLight + deformed.force * 0.18
        );
      }

      output[deformed.row][deformed.col] = ch;
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
  const lastRotationTime = useRef(0);
  const shockwaveRef = useRef({
    x: 0,
    y: 0,
    startedAt: 0,
    active: false,
  });

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
    const readShockwave = (time: number): ShockwaveState | null => {
      const shockwave = shockwaveRef.current;

      if (!shockwave.active) {
        return null;
      }

      const progress = (time - shockwave.startedAt) / SHOCKWAVE_DURATION_MS;

      if (progress >= 1) {
        shockwave.active = false;
        return null;
      }

      const easedProgress = progress * progress * (3 - 2 * progress);
      const intensity = (1 - progress) ** 0.9;

      return {
        x: shockwave.x,
        y: shockwave.y,
        radius: easedProgress * SHOCKWAVE_MAX_RADIUS,
        width: SHOCKWAVE_WIDTH + progress * 0.08,
        intensity,
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
            lastRotationTime.current = time;
          }
        }
      } else {
        if (time - lastRotationTime.current >= ROTATION_TICK_MS) {
          lastRotationTime.current = time;
          rotationTick.current++;
        }

        setText(
          computeRotatedText(
            rotationTick.current,
            readPointerLight(),
            readShockwave(time)
          )
        );
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

  const readPointerPosition = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect =
      preRef.current?.getBoundingClientRect() ??
      event.currentTarget.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const pointerCol = ((event.clientX - rect.left) / rect.width) * GRID_COLS;
    const pointerRow = ((event.clientY - rect.top) / rect.height) * GRID_ROWS;

    return {
      x: clamp((pointerCol - centerCol) / (GRID_COLS * 0.5), -1.2, 1.2),
      y: clamp((pointerRow - centerRow) / (GRID_ROWS * 0.5), -1.2, 1.2),
    };
  };

  const updatePointerLight = (event: React.PointerEvent<HTMLDivElement>) => {
    const position = readPointerPosition(event);

    if (!position) {
      return;
    }

    const pointer = pointerRef.current;

    pointer.targetX = position.x;
    pointer.targetY = position.y;
    pointer.targetIntensity = 1;
  };

  const dimPointerLight = () => {
    pointerRef.current.targetIntensity = 0;
  };

  const triggerShockwave = (event: React.PointerEvent<HTMLDivElement>) => {
    const position = readPointerPosition(event);

    if (!position) {
      return;
    }

    const pointer = pointerRef.current;

    pointer.targetX = position.x;
    pointer.targetY = position.y;
    pointer.targetIntensity = 1;
    shockwaveRef.current = {
      x: position.x,
      y: position.y,
      startedAt: performance.now(),
      active: true,
    };
  };

  return (
    <div
      ref={ref}
      onPointerMove={updatePointerLight}
      onPointerDown={triggerShockwave}
      onPointerLeave={dimPointerLight}
      className="mx-auto flex aspect-square w-full max-w-[26rem] cursor-crosshair select-none items-center justify-center overflow-hidden sm:mx-0 sm:min-h-[325px] sm:max-w-none sm:aspect-auto md:min-h-[410px] lg:min-h-[490px]"
      aria-hidden="true"
    >
      <pre
        ref={preRef}
        className="font-mono text-[7.75px] leading-[1.32] text-black dark:text-white sm:text-[8px] sm:leading-[1.4] md:text-[10px] lg:text-xs whitespace-pre"
      >
        {EMPTY_TEXT}
      </pre>
    </div>
  );
}

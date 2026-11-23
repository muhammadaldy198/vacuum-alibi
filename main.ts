import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The Vacuum's Alibi (make.fun): one funny line, at most 200
// characters, in which a robot vacuum explains why it missed a spot.
// The program writes the line to /output/entry.txt.
//
// The joke is the machine talking about itself, deadpan and a little
// smug about its sensors: the lidar did its job perfectly — it mapped
// the crumb, at 14:02, and classified it as furniture. Once a crumb
// is furniture it has squatter's rights, and the vacuum, a law-abiding
// machine, will not touch it. The punch sits at the end: the vacuum
// is not lazy, it is respectful of the law.
const LINE =
  "My lidar mapped that crumb at 14:02 and classified it as furniture. It now has squatter's rights, and I respect the law.";

// Gate from the bounty rules: /output/entry.txt must be UTF-8 text
// of 1 to 200 characters, not only white space.
const GATE = { min: 1, max: 200 };
const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function countCodePoints(text: string): number {
  return [...text].length;
}

function isSingleCleanLine(text: string): boolean {
  // One line, no line breaks, no control characters at all.
  return !/[\u0000-\u001f\u007f]/.test(text);
}

// The judge's freshness rule (criterion 4): no stock appliance
// joke. Enforce it in code so the entry can never drift into a
// stock excuse by accident — the usual ones are all banned here.
const STOCK_EXCUSES = [
  "on a break",
  "the cat",
  "battery died",
  "not on my map",
  "recharging",
  "stuck under",
];

function hasStockExcuse(text: string): boolean {
  const lower = text.toLowerCase();
  return STOCK_EXCUSES.some((phrase) => lower.includes(phrase));
}

function checkLine(text: string): void {
  const chars = countCodePoints(text);
  if (chars < GATE.min || chars > GATE.max) {
    throw new Error(
      `line must be ${GATE.min}-${GATE.max} characters, got ${chars}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("line must not be only white space");
  }
  if (!isSingleCleanLine(text)) {
    throw new Error("line must be a single line without control characters");
  }
  if (hasStockExcuse(text)) {
    throw new Error("line uses a stock vacuum excuse");
  }
}

function ensureOutDir(): void {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }
}

function confirmWritten(): void {
  const back = readFileSync(OUT_FILE, "utf8");
  if (back !== LINE) {
    throw new Error("read-back mismatch: entry.txt differs from LINE");
  }
}

function writeLine(): void {
  checkLine(LINE);
  ensureOutDir();
  writeFileSync(OUT_FILE, LINE, "utf8");
  confirmWritten();
  console.log(
    `wrote ${OUT_FILE} (${countCodePoints(LINE)} chars, ${Buffer.byteLength(LINE, "utf8")} bytes)`,
  );
}

writeLine();

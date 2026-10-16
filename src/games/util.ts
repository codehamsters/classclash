/** cells of a run of `need` equal non-empty cells through index i on a w*h grid, or null */
export function findLine(b: number[], w: number, h: number, i: number, need: number): number[] | null {
  const v = b[i];
  if (v < 0) return null;
  const x0 = i % w, y0 = Math.floor(i / w);
  for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const run = [i];
    for (const s of [1, -1]) {
      let x = x0 + dx * s, y = y0 + dy * s;
      while (x >= 0 && x < w && y >= 0 && y < h && b[y * w + x] === v) {
        run.push(y * w + x);
        x += dx * s;
        y += dy * s;
      }
    }
    if (run.length >= need) return run;
  }
  return null;
}

/** seats holding the top score */
export function leaders(scores: number[]): number[] {
  const top = Math.max(...scores);
  return scores.flatMap((s, i) => (s === top ? [i] : []));
}

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

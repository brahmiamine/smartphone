export type Points = Array<[number, number]>;

export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function validateScale(scale: Points, label = "barème") {
  if (!Array.isArray(scale) || scale.length < 2) throw new Error(`${label} doit contenir au moins deux repères`);
  for (let index = 0; index < scale.length; index += 1) {
    const [input, score] = scale[index];
    if (!Number.isFinite(input) || !Number.isFinite(score)) throw new Error(`${label} contient une valeur invalide`);
    if (score < 0 || score > 100) throw new Error(`${label} contient un score hors de 0–100`);
    if (index > 0 && input <= scale[index - 1][0]) throw new Error(`${label} doit être strictement croissant`);
  }
}

export function interpolate(value: number | null, scale: Points) {
  validateScale(scale);
  if (value === null || !Number.isFinite(value)) return null;
  if (value <= scale[0][0]) return scale[0][1];
  for (let index = 1; index < scale.length; index += 1) {
    const [x2, y2] = scale[index];
    const [x1, y1] = scale[index - 1];
    if (value <= x2) return y1 + ((value - x1) / (x2 - x1)) * (y2 - y1);
  }
  return scale.at(-1)?.[1] ?? null;
}

export function inverseInterpolate(value: number | null, scale: Points) {
  if (value === null) return null;
  return interpolate(-value, scale.map(([input, score]) => [-input, score] as [number, number]).reverse());
}

export function weightedAvailable(values: Array<{ value: number | null; weight: number }>) {
  const available = values.filter((item): item is { value: number; weight: number } => item.value !== null && Number.isFinite(item.value));
  const weight = available.reduce((sum, item) => sum + item.weight, 0);
  if (!weight) return 0;
  return clamp(available.reduce((sum, item) => sum + item.value * item.weight, 0) / weight);
}

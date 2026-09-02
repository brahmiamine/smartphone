import scales from "@/data/scales.json";
import type { CategoryScores, Phone, RankedPhone, Weights } from "@/lib/types";

export type { CategoryScores, Phone, RankedPhone, Weights } from "@/lib/types";

type Points = Array<[number, number]>;
const points = (value: number[][]) => value as Points;
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function interpolate(value: number, scale: Points) {
  if (value <= scale[0][0]) return scale[0][1];
  for (let index = 1; index < scale.length; index += 1) {
    const [x2, y2] = scale[index];
    const [x1, y1] = scale[index - 1];
    if (value <= x2) return y1 + ((value - x1) / (x2 - x1)) * (y2 - y1);
  }
  return scale.at(-1)?.[1] ?? 100;
}

export const capacityScore = (capacityMah: number) => clamp(interpolate(capacityMah, points(scales.batteryCapacity)));
export const cpuScore = (phone: Phone) => clamp(interpolate(phone.performance.antutu, points(scales.cpuBenchmark)));
export const ramScore = (ramGB: number) => clamp(interpolate(ramGB, points(scales.ram)));

// La priorité « Batterie » représente l'autonomie potentielle : la capacité seule
// détermine donc cet indice. La vitesse de charge reste visible dans les caractéristiques.
export const batteryScore = (phone: Phone) => capacityScore(phone.battery.capacityMah);

function cameraHardwareScore(phone: Phone) {
  const camera = phone.camera;
  const w = scales.camera.hardwareWeights;
  const main = interpolate(camera.mainMP, points(scales.camera.mainMegapixels));
  const sensor = interpolate(scales.camera.sensorTransformBase - camera.sensorDenominator, points(scales.camera.sensor));
  const ultrawide = camera.ultrawideMP ? interpolate(camera.ultrawideMP, points(scales.camera.ultrawideMegapixels)) : 0;
  const zoom = camera.teleZoom ? interpolate(camera.teleZoom, points(scales.camera.opticalZoom)) : 0;
  const selfie = interpolate(camera.selfieMP, points(scales.camera.selfieMegapixels));
  const videoBase = camera.videoK >= 8 ? 100 : camera.videoK >= 4 ? 72 : 45;
  const video = clamp(videoBase + (camera.videoFps >= 120 ? 15 : camera.videoFps >= 60 ? 8 : 0));
  return clamp((
    main * w.main + sensor * w.sensor + (camera.ois ? 100 : 30) * w.ois + ultrawide * w.ultrawide +
    zoom * w.zoom + video * w.video + selfie * w.selfie
  ) / 100);
}

export function cameraScore(phone: Phone) {
  const hardware = cameraHardwareScore(phone);
  if (!phone.camera.dxomark) return hardware;
  const lab = interpolate(phone.camera.dxomark, points(scales.camera.dxomark));
  return clamp((lab * scales.camera.labWeight + hardware * scales.camera.hardwareWeightWithLab) / 100);
}

export function screenScore(phone: Phone) {
  const w = scales.screen.weights;
  const resolution = interpolate(phone.screen.widthPx * phone.screen.heightPx, points(scales.screen.pixels));
  const refresh = interpolate(phone.screen.refreshHz, points(scales.screen.refreshRate));
  const brightness = interpolate(phone.screen.brightnessNits, points(scales.screen.brightness));
  const panel = scales.screen.panelScores[phone.screen.panel];
  return clamp((resolution * w.resolution + refresh * w.refresh + brightness * w.brightness + (phone.screen.ltpo ? 100 : 55) * w.ltpo + panel * w.panel) / 100);
}

export function durabilityScore(phone: Phone) {
  const w = scales.durability.weights;
  const ip = scales.durability.ipScores[phone.durability.ip];
  const drop = interpolate(phone.durability.dropMeters, points(scales.durability.dropMeters));
  const glass = scales.durability.glassScores[phone.durability.glass];
  return clamp((ip * w.ip + drop * w.drop + glass * w.glass) / 100);
}

export function scorePhone(phone: Phone, weights: Weights) {
  const categoryScores: CategoryScores = {
    cpu: cpuScore(phone),
    ram: ramScore(phone.performance.ramGB),
    battery: batteryScore(phone),
    camera: cameraScore(phone),
    screen: screenScore(phone),
    durability: durabilityScore(phone),
  };
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const total = Object.entries(categoryScores).reduce((sum, [key, value]) => sum + value * weights[key as keyof Weights], 0) / totalWeight;
  return { total: clamp(total), categoryScores };
}

export function rankPhones(phones: Phone[], weights: Weights): RankedPhone[] {
  return phones
    .map((phone) => ({ ...phone, ...scorePhone(phone, weights) }))
    .sort((a, b) => {
      const totalDifference = b.total - a.total;
      if (Math.abs(totalDifference) > 0.0001) return totalDifference;
      if (weights.battery === 100) return b.battery.capacityMah - a.battery.capacityMah;
      return b.performance.antutu - a.performance.antutu;
    })
    .map((phone, index) => ({ ...phone, rank: index + 1 }));
}

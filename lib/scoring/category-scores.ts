import scales from "@/data/scales.json";
import type { Phone } from "@/lib/types";
import { clamp, interpolate, inverseInterpolate, type Points, weightedAvailable } from "./interpolation";

const points = (value: number[][]) => value as Points;
export const ppi = (phone: Phone) => Math.sqrt(phone.screen.widthPx ** 2 + phone.screen.heightPx ** 2) / phone.screen.diagonal;

export function performanceScore(phone: Phone) {
  const benchmarkScale = phone.os === "iOS" ? scales.performance.iosBenchmark : scales.performance.androidBenchmark;
  return weightedAvailable([
    { value: interpolate(phone.performance.antutu, points(benchmarkScale)), weight: scales.performance.weights.benchmark },
    { value: interpolate(phone.performance.sustainedPercent, points(scales.performance.sustainedPercent)), weight: scales.performance.weights.sustained },
  ]);
}

export function multitaskingScore(phone: Phone) {
  const scale = phone.os === "iOS" ? scales.ram.ios : scales.ram.android;
  return clamp(interpolate(phone.performance.ramGB, points(scale)) ?? 0);
}

export const capacityScore = (capacityMah: number) => clamp(interpolate(capacityMah, points(scales.autonomy.capacityMah)) ?? 0);

export function autonomyScore(phone: Phone) {
  return weightedAvailable([
    { value: interpolate(phone.battery.activeUseHours, points(scales.autonomy.activeUseHours)), weight: scales.autonomy.weights.activeUse },
    { value: interpolate(phone.battery.capacityMah, points(scales.autonomy.capacityMah)), weight: scales.autonomy.weights.capacity },
    { value: interpolate(phone.battery.cyclesTo80, points(scales.autonomy.cyclesTo80)), weight: scales.autonomy.weights.cycles },
  ]);
}

export function chargingScore(phone: Phone) {
  return weightedAvailable([
    { value: inverseInterpolate(phone.battery.chargeMinutes, points(scales.charging.minutes0To100)), weight: scales.charging.weights.time },
    { value: interpolate(phone.battery.wiredW, points(scales.charging.wiredW)), weight: scales.charging.weights.wired },
    { value: interpolate(phone.battery.wirelessW, points(scales.charging.wirelessW)), weight: scales.charging.weights.wireless },
  ]);
}

export function cameraScore(phone: Phone) {
  const photo = cameraPhotoScore(phone);
  return weightedAvailable([
    { value: photo, weight: scales.camera.subWeights.photo },
    { value: phone.camera.videoIndex, weight: scales.camera.subWeights.video },
    { value: phone.camera.selfieIndex, weight: scales.camera.subWeights.selfie },
  ]);
}

export function cameraPhotoScore(phone: Phone) {
  if (!phone.camera.dxomark || !phone.camera.dxomarkProtocol) return phone.camera.photoIndex;
  const protocolScale = phone.camera.dxomarkProtocol === "V6" ? scales.camera.dxomarkV6 : scales.camera.dxomarkV5;
  const normalizedLab = interpolate(phone.camera.dxomark, points(protocolScale));
  return weightedAvailable([{ value: normalizedLab, weight: 70 }, { value: phone.camera.photoIndex, weight: 30 }]);
}

export function screenScore(phone: Phone) {
  const w = scales.screen.weights;
  return weightedAvailable([
    { value: interpolate(ppi(phone), points(scales.screen.ppi)), weight: w.ppi },
    { value: interpolate(phone.screen.refreshHz, points(scales.screen.refreshRate)), weight: w.refresh },
    { value: interpolate(phone.screen.brightnessNits, points(scales.screen.brightness)), weight: w.brightness },
    { value: phone.screen.ltpo ? 100 : 55, weight: w.ltpo },
    { value: scales.screen.panelScores[phone.screen.panel], weight: w.panel },
  ]);
}

export function durabilityScore(phone: Phone) {
  const w = scales.durability.weights;
  return weightedAvailable([
    { value: scales.durability.ipScores[phone.durability.ip], weight: w.ip },
    { value: interpolate(phone.durability.dropMeters, points(scales.durability.dropMeters)), weight: w.drop },
    { value: scales.durability.glassScores[phone.durability.glass], weight: w.glass },
    { value: interpolate(phone.durability.repairabilityScore, points(scales.durability.repairability)), weight: w.repairability },
  ]);
}

export function storageScore(phone: Phone) {
  const w = scales.storage.weights;
  return weightedAvailable([
    { value: interpolate(phone.performance.storage.capacityGB, points(scales.storage.capacityGB)), weight: w.capacity },
    { value: scales.storage.typeScores[phone.performance.storage.type], weight: w.type },
    { value: phone.performance.storage.expandable ? 100 : 35, weight: w.expandable },
  ]);
}

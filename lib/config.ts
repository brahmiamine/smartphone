import { BatteryCharging, Camera, Cpu, MemoryStick, MonitorSmartphone, ShieldCheck } from "lucide-react";
import type { CriterionKey, Weights } from "@/lib/types";

export const DEFAULT_WEIGHTS: Weights = { cpu: 20, ram: 10, battery: 25, camera: 25, screen: 10, durability: 10 };

export const CRITERIA: Record<CriterionKey, { label: string; shortLabel: string; icon: typeof Cpu; color: string }> = {
  cpu: { label: "Performance CPU", shortLabel: "CPU", icon: Cpu, color: "#7757ff" },
  ram: { label: "Mémoire RAM", shortLabel: "RAM", icon: MemoryStick, color: "#b652cc" },
  battery: { label: "Batterie", shortLabel: "BAT", icon: BatteryCharging, color: "#21b47e" },
  camera: { label: "Caméra", shortLabel: "CAM", icon: Camera, color: "#f05d52" },
  screen: { label: "Écran", shortLabel: "ÉCR", icon: MonitorSmartphone, color: "#1f8fd1" },
  durability: { label: "Résistance", shortLabel: "RÉS", icon: ShieldCheck, color: "#e89b2c" },
};

export const PRESETS: Array<{ label: string; weights: Weights }> = [
  { label: "Équilibré", weights: DEFAULT_WEIGHTS },
  { label: "Autonomie", weights: { cpu: 10, ram: 5, battery: 45, camera: 15, screen: 15, durability: 10 } },
  { label: "Photo", weights: { cpu: 10, ram: 5, battery: 15, camera: 50, screen: 15, durability: 5 } },
  { label: "Gaming", weights: { cpu: 35, ram: 15, battery: 25, camera: 5, screen: 15, durability: 5 } },
  { label: "Robuste", weights: { cpu: 10, ram: 5, battery: 25, camera: 10, screen: 10, durability: 40 } },
];

export const criterionKeys = Object.keys(CRITERIA) as CriterionKey[];
export const formatScore = (value: number) => value.toFixed(1).replace(".0", "");

export function updateWeightKeepingTotal(weights: Weights, key: CriterionKey, nextValue: number): Weights {
  const others = criterionKeys.filter((item) => item !== key);
  const available = 100 - nextValue;
  const previousOthers = others.reduce((sum, item) => sum + weights[item], 0);
  const next = { ...weights, [key]: nextValue };
  let used = 0;
  others.forEach((item, index) => {
    const value = index === others.length - 1
      ? Math.max(0, Number((available - used).toFixed(1)))
      : Number((previousOthers > 0 ? (weights[item] / previousOthers) * available : available / others.length).toFixed(1));
    next[item] = value;
    used += value;
  });
  return next;
}

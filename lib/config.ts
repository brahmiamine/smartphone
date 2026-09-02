import { BatteryCharging, Camera, Cpu, Database, Gauge, MemoryStick, MonitorSmartphone, ShieldCheck } from "lucide-react";
import type { CriterionKey, PhoneFilters, Weights } from "@/lib/types";

export const DEFAULT_WEIGHTS: Weights = {
  performance: 18, multitasking: 10, autonomy: 20, charging: 10,
  camera: 20, screen: 10, durability: 7, storage: 5,
};

export const DEFAULT_FILTERS: PhoneFilters = {
  os: "Tous", formFactor: "Tous", esimOnly: false, network: "Toutes", dualSimOnly: false,
};

export const CRITERIA: Record<CriterionKey, { label: string; shortLabel: string; icon: typeof Cpu; color: string; description: string }> = {
  performance: { label: "Performances réelles", shortLabel: "PERF", icon: Cpu, color: "#7757ff", description: "Puce et stabilité sous charge" },
  multitasking: { label: "Multitâche / RAM", shortLabel: "RAM", icon: MemoryStick, color: "#b652cc", description: "RAM normalisée selon le système" },
  autonomy: { label: "Autonomie réelle", shortLabel: "AUTO", icon: Gauge, color: "#21b47e", description: "Durée active, capacité et longévité" },
  charging: { label: "Recharge", shortLabel: "CHG", icon: BatteryCharging, color: "#0d9f87", description: "Temps réel, puissance et sans-fil" },
  camera: { label: "Caméra", shortLabel: "CAM", icon: Camera, color: "#f05d52", description: "Photo 55 %, vidéo 30 %, selfie 15 %" },
  screen: { label: "Écran", shortLabel: "ÉCR", icon: MonitorSmartphone, color: "#1f8fd1", description: "Finesse, fluidité, luminosité et LTPO" },
  durability: { label: "Résistance et réparabilité", shortLabel: "RÉS", icon: ShieldCheck, color: "#e89b2c", description: "Indice IP, chutes et réparabilité" },
  storage: { label: "Stockage", shortLabel: "STO", icon: Database, color: "#55708f", description: "Capacité, technologie et extension" },
};

export const PRESETS: Array<{ label: string; weights: Weights }> = [
  { label: "Équilibré", weights: DEFAULT_WEIGHTS },
  { label: "Autonomie", weights: { performance: 10, multitasking: 7, autonomy: 38, charging: 15, camera: 10, screen: 8, durability: 7, storage: 5 } },
  { label: "Photo / vidéo", weights: { performance: 10, multitasking: 5, autonomy: 12, charging: 5, camera: 48, screen: 10, durability: 5, storage: 5 } },
  { label: "Gaming", weights: { performance: 33, multitasking: 15, autonomy: 20, charging: 10, camera: 4, screen: 13, durability: 2, storage: 3 } },
  { label: "Robuste", weights: { performance: 10, multitasking: 5, autonomy: 18, charging: 7, camera: 10, screen: 8, durability: 37, storage: 5 } },
  { label: "Gros fichiers", weights: { performance: 18, multitasking: 18, autonomy: 15, charging: 7, camera: 8, screen: 7, durability: 5, storage: 22 } },
];

export const criterionKeys = Object.keys(CRITERIA) as CriterionKey[];
export const formatScore = (value: number) => value.toFixed(1).replace(".0", "");

export function updateWeightKeepingTotal(weights: Weights, key: CriterionKey, rawValue: number): Weights {
  const nextValue = Math.min(100, Math.max(0, Math.round(rawValue)));
  const others = criterionKeys.filter((item) => item !== key);
  const available = 100 - nextValue;
  const previousOthers = others.reduce((sum, item) => sum + weights[item], 0);
  const shares = others.map((item) => previousOthers > 0 ? (weights[item] / previousOthers) * available : available / others.length);
  const allocated = shares.map(Math.floor);
  const remainder = available - allocated.reduce((sum, value) => sum + value, 0);
  const priority = shares.map((value, index) => ({ index, fraction: value - allocated[index] })).sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; index < remainder; index += 1) allocated[priority[index].index] += 1;
  return others.reduce((next, item, index) => ({ ...next, [item]: allocated[index] }), { ...weights, [key]: nextValue });
}

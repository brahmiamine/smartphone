export type StorageType = "UFS 2.2" | "UFS 3.1" | "UFS 4.0" | "UFS 4.1";
export type CoolingType = "Standard" | "Chambre à vapeur" | "Refroidissement actif";
export type BatteryTech = "Lithium-ion" | "Silicium-carbone";
export type IpRating = "Aucune" | "IP65" | "IP68" | "IP69" | "IP69K" | "IPX8";
export type GlassTier = "Standard" | "Renforcé" | "Premium" | "Certifié chutes";

export type Weights = {
  cpu: number;
  ram: number;
  battery: number;
  camera: number;
  screen: number;
  durability: number;
};

export type Phone = {
  id: string;
  name: string;
  brand: string;
  release: string;
  market: string;
  sourceUrl?: string;
  performance: {
    chipset: string;
    antutu: number;
    ramGB: number;
    storage: StorageType;
    cooling: CoolingType;
  };
  battery: {
    capacityMah: number;
    wiredW: number;
    wirelessW: number;
    technology: BatteryTech;
  };
  camera: {
    mainMP: number;
    sensorDenominator: number;
    ultrawideMP: number;
    teleZoom: number;
    selfieMP: number;
    ois: boolean;
    videoK: number;
    videoFps: number;
    dxomark: number;
  };
  screen: {
    panel: "LCD" | "OLED" | "AMOLED";
    diagonal: number;
    widthPx: number;
    heightPx: number;
    refreshHz: number;
    brightnessNits: number;
    ltpo: boolean;
  };
  durability: {
    ip: IpRating;
    dropMeters: number;
    glass: GlassTier;
    label: string;
  };
};

export const DEFAULT_WEIGHTS: Weights = {
  cpu: 20,
  ram: 10,
  battery: 25,
  camera: 25,
  screen: 10,
  durability: 10,
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

function interpolate(value: number, points: Array<[number, number]>) {
  if (value <= points[0][0]) return points[0][1];
  for (let index = 1; index < points.length; index += 1) {
    const [x2, y2] = points[index];
    const [x1, y1] = points[index - 1];
    if (value <= x2) {
      const ratio = (value - x1) / (x2 - x1);
      return y1 + ratio * (y2 - y1);
    }
  }
  return points.at(-1)?.[1] ?? 100;
}

const storageScores: Record<StorageType, number> = {
  "UFS 2.2": 45,
  "UFS 3.1": 72,
  "UFS 4.0": 91,
  "UFS 4.1": 100,
};

const coolingScores: Record<CoolingType, number> = {
  Standard: 45,
  "Chambre à vapeur": 78,
  "Refroidissement actif": 100,
};

const ipScores: Record<IpRating, number> = {
  Aucune: 20,
  IP65: 46,
  IP68: 74,
  IP69: 89,
  IP69K: 96,
  IPX8: 68,
};

const glassScores: Record<GlassTier, number> = {
  Standard: 42,
  Renforcé: 68,
  Premium: 88,
  "Certifié chutes": 100,
};

export function capacityScore(capacityMah: number) {
  return clamp(
    interpolate(capacityMah, [
      [3000, 35],
      [5000, 58],
      [7000, 80],
      [8000, 80],
      [10000, 95],
      [11000, 100],
    ]),
  );
}

export function cpuScore(phone: Phone) {
  return clamp(interpolate(phone.performance.antutu, [
    [300000, 28],
    [600000, 43],
    [750000, 50],
    [1000000, 62],
    [1200000, 70],
    [2500000, 82],
    [3200000, 90],
    [3900000, 96],
    [4300000, 100],
  ]));
}

export function ramScore(ramGB: number) {
  return clamp(interpolate(ramGB, [
    [4, 38],
    [6, 52],
    [8, 70],
    [12, 90],
    [16, 95],
    [24, 100],
  ]));
}

export function performanceScore(phone: Phone) {
  return clamp(
    cpuScore(phone) * 0.78 +
      ramScore(phone.performance.ramGB) * 0.08 +
      storageScores[phone.performance.storage] * 0.08 +
      coolingScores[phone.performance.cooling] * 0.06,
  );
}

export function batteryScore(phone: Phone) {
  const capacity = capacityScore(phone.battery.capacityMah);
  const wired = interpolate(phone.battery.wiredW, [
    [10, 20],
    [44, 54],
    [66, 68],
    [80, 78],
    [100, 89],
    [120, 96],
    [150, 100],
  ]);
  const wireless = phone.battery.wirelessW
    ? interpolate(phone.battery.wirelessW, [
        [10, 35],
        [30, 62],
        [50, 82],
        [80, 100],
      ])
    : 0;
  const technology = phone.battery.technology === "Silicium-carbone" ? 100 : 58;
  return clamp(capacity * 0.8 + wired * 0.12 + wireless * 0.05 + technology * 0.03);
}

function cameraHardwareScore(phone: Phone) {
  const camera = phone.camera;
  const main = interpolate(camera.mainMP, [
    [12, 35],
    [50, 70],
    [108, 86],
    [200, 100],
  ]);
  const sensor = interpolate(3.1 - camera.sensorDenominator, [
    [0, 35],
    [1.1, 62],
    [1.55, 82],
    [1.8, 94],
    [2.1, 100],
  ]);
  const ultrawide = camera.ultrawideMP
    ? interpolate(camera.ultrawideMP, [
        [5, 35],
        [8, 50],
        [12, 62],
        [50, 100],
      ])
    : 0;
  const zoom = camera.teleZoom
    ? interpolate(camera.teleZoom, [
        [2, 45],
        [3, 65],
        [3.7, 80],
        [5, 100],
      ])
    : 0;
  const selfie = interpolate(camera.selfieMP, [
    [8, 42],
    [16, 60],
    [32, 82],
    [50, 100],
  ]);
  const videoBase = camera.videoK >= 8 ? 100 : camera.videoK >= 4 ? 72 : 45;
  const video = clamp(videoBase + (camera.videoFps >= 120 ? 15 : camera.videoFps >= 60 ? 8 : 0));

  return clamp(
    main * 0.15 +
      sensor * 0.25 +
      (camera.ois ? 100 : 30) * 0.1 +
      ultrawide * 0.15 +
      zoom * 0.2 +
      video * 0.1 +
      selfie * 0.05,
  );
}

export function cameraScore(phone: Phone) {
  const hardware = cameraHardwareScore(phone);
  if (!phone.camera.dxomark) return hardware;
  const lab = interpolate(phone.camera.dxomark, [
    [90, 40],
    [120, 62],
    [145, 80],
    [160, 92],
    [175, 100],
  ]);
  return clamp(lab * 0.65 + hardware * 0.35);
}

export function screenScore(phone: Phone) {
  const pixels = phone.screen.widthPx * phone.screen.heightPx;
  const resolution = interpolate(pixels, [
    [1500000, 45],
    [2400000, 68],
    [3600000, 86],
    [4700000, 100],
  ]);
  const refresh = interpolate(phone.screen.refreshHz, [
    [60, 42],
    [90, 64],
    [120, 82],
    [144, 92],
    [165, 97],
    [185, 100],
  ]);
  const brightness = interpolate(phone.screen.brightnessNits, [
    [600, 38],
    [1000, 55],
    [1800, 80],
    [2500, 91],
    [4000, 100],
  ]);
  const panel = phone.screen.panel === "LCD" ? 45 : phone.screen.panel === "OLED" ? 92 : 100;
  return clamp(
    resolution * 0.3 +
      refresh * 0.25 +
      brightness * 0.2 +
      (phone.screen.ltpo ? 100 : 55) * 0.15 +
      panel * 0.1,
  );
}

export function durabilityScore(phone: Phone) {
  const drop = interpolate(phone.durability.dropMeters, [
    [0, 30],
    [1, 55],
    [1.2, 64],
    [1.5, 75],
    [2, 88],
    [2.5, 96],
    [3, 100],
  ]);
  return clamp(
    ipScores[phone.durability.ip] * 0.45 +
      drop * 0.35 +
      glassScores[phone.durability.glass] * 0.2,
  );
}

export function scorePhone(phone: Phone, weights: Weights) {
  const categoryScores = {
    cpu: cpuScore(phone),
    ram: ramScore(phone.performance.ramGB),
    battery: batteryScore(phone),
    camera: cameraScore(phone),
    screen: screenScore(phone),
    durability: durabilityScore(phone),
  };
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const total =
    Object.entries(categoryScores).reduce(
      (sum, [key, value]) => sum + value * weights[key as keyof Weights],
      0,
    ) / totalWeight;

  return { total: clamp(total), categoryScores };
}

export function normalizedWeights(weights: Weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(
    Object.entries(weights).map(([key, value]) => [key, (value / total) * 100]),
  ) as Weights;
}

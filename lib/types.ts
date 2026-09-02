export type StorageType = "UFS 2.2" | "UFS 3.1" | "UFS 4.0" | "UFS 4.1" | "UFS zonée" | "NVMe" | "Non communiqué";
export type CoolingType = "Standard" | "Chambre à vapeur" | "Refroidissement actif";
export type BatteryTech = "Lithium-ion" | "Silicium-carbone";
export type IpRating = "Aucune" | "IP49" | "IP65" | "IP68" | "IP69" | "IP69K" | "IPX8";
export type GlassTier = "Standard" | "Renforcé" | "Premium" | "Certifié chutes";

export type Weights = {
  cpu: number;
  ram: number;
  battery: number;
  camera: number;
  screen: number;
  durability: number;
};

export type CriterionKey = keyof Weights;

export type Phone = {
  id: string;
  name: string;
  brand: string;
  release: string;
  market: string;
  sourceUrl?: string;
  cameraLabUrl?: string;
  estimatedFields?: string[];
  performance: { chipset: string; antutu: number; ramGB: number; storage: StorageType; cooling: CoolingType };
  battery: { capacityMah: number; wiredW: number; wirelessW: number; technology: BatteryTech };
  camera: { mainMP: number; sensorDenominator: number; ultrawideMP: number; teleZoom: number; selfieMP: number; ois: boolean; videoK: number; videoFps: number; dxomark: number };
  screen: { panel: "LCD" | "OLED" | "AMOLED" | "pOLED"; diagonal: number; widthPx: number; heightPx: number; refreshHz: number; brightnessNits: number; ltpo: boolean };
  durability: { ip: IpRating; dropMeters: number; glass: GlassTier; label: string };
};

export type CategoryScores = Record<CriterionKey, number>;
export type RankedPhone = Phone & { total: number; categoryScores: CategoryScores; rank: number };

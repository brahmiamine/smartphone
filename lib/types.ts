export type StorageType = "eMMC 5.1" | "UFS 2.2" | "UFS 3.1" | "UFS 4.0" | "UFS 4.1" | "UFS zonée" | "NVMe" | "Non communiqué";
export type CoolingType = "Standard" | "Chambre à vapeur" | "Refroidissement actif";
export type BatteryTech = "Lithium-ion" | "Silicium-carbone";
export type IpRating = "Aucune" | "IP48" | "IP49" | "IP52" | "IP54" | "IP64" | "IP65" | "IP67" | "IP68" | "IP69" | "IP69K" | "IPX8";
export type GlassTier = "Standard" | "Renforcé" | "Premium" | "Certifié chutes";
export type DataBasis = "Mesuré" | "Déclaré" | "Estimé";
export type OperatingSystem = "Android" | "iOS";
export type FormFactor = "Classique" | "Pliable";
export type NetworkGeneration = "4G" | "5G";

export type CriterionKey = "performance" | "multitasking" | "autonomy" | "charging" | "camera" | "screen" | "durability" | "storage";
export type Weights = Record<CriterionKey, number>;
export type CategoryScores = Record<CriterionKey, number>;

export type Source = {
  label: string;
  url: string;
  type: "Constructeur" | "Laboratoire" | "Presse spécialisée";
};

export type Phone = {
  id: string;
  name: string;
  brand: string;
  release: string;
  releaseYear: 2024 | 2025 | 2026;
  market: string;
  os: OperatingSystem;
  osName: string;
  formFactor: FormFactor;
  connectivity: { esim: boolean; network: NetworkGeneration; dualSim: boolean };
  sourceUrl?: string;
  cameraLabUrl?: string;
  sources: Source[];
  estimatedFields: string[];
  dataQuality: { confidence: number; verifiedAt: string };
  performance: {
    chipset: string;
    antutu: number | null;
    benchmarkVersion: string;
    sustainedPercent: number | null;
    ramGB: number;
    storage: { capacityGB: number; type: StorageType; expandable: boolean };
    cooling: CoolingType;
  };
  battery: {
    capacityMah: number;
    activeUseHours: number | null;
    autonomyBasis: DataBasis;
    cyclesTo80: number | null;
    wiredW: number;
    wirelessW: number;
    chargeMinutes: number | null;
    chargingBasis: DataBasis;
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
    dxomark: number | null;
    dxomarkProtocol: "V5" | "V6" | null;
    photoIndex: number;
    videoIndex: number;
    selfieIndex: number;
    qualityBasis: DataBasis;
  };
  screen: {
    panel: "LCD" | "OLED" | "AMOLED" | "pOLED";
    diagonal: number;
    widthPx: number;
    heightPx: number;
    refreshHz: number;
    brightnessNits: number;
    brightnessBasis: DataBasis;
    ltpo: boolean;
  };
  durability: {
    ip: IpRating;
    dropMeters: number | null;
    glass: GlassTier;
    repairabilityScore: number | null;
    repairabilityBasis: DataBasis;
    label: string;
  };
};

export type PhoneFilters = {
  os: "Tous" | OperatingSystem;
  formFactor: "Tous" | FormFactor;
  esimOnly: boolean;
  network: "Toutes" | NetworkGeneration;
  dualSimOnly: boolean;
};

export type RankedPhone = Phone & {
  total: number;
  categoryScores: CategoryScores;
  confidence: number;
  stability: number;
  rank: number;
  closeToPrevious: boolean;
};

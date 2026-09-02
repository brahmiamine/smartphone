import { BatteryCharging, Camera, Cpu, Database, Gauge, Info, MemoryStick, MonitorSmartphone, ShieldCheck } from "lucide-react";
import scales from "@/data/scales.json";
import { PHONES } from "@/lib/catalog";
import { autonomyScore, chargingScore, durabilityScore, multitaskingScore, performanceScore, screenScore, storageScore } from "@/lib/scoring";
import { IndexCard, type IndexItem } from "./index-card";

const bestBy = (key: (phone: (typeof PHONES)[number]) => string, score: (phone: (typeof PHONES)[number]) => number, detail: (phone: (typeof PHONES)[number]) => string) => {
  const map = new Map<string, (typeof PHONES)[number]>();
  for (const phone of PHONES) if (!map.has(key(phone)) || score(phone) > score(map.get(key(phone))!)) map.set(key(phone), phone);
  return [...map.entries()].map(([label, phone]) => ({ label, score: score(phone), detail: detail(phone) })).sort((a, b) => b.score - a.score);
};

const points = (values: number[][], suffix: string, detail: string): IndexItem[] => values.map(([value, score]) => ({ label: `${value.toLocaleString("fr-FR")}${suffix}`, score, detail }));

export function BenchmarkSection() {
  const performance = bestBy(phone => phone.performance.chipset, performanceScore, phone => `${phone.performance.sustainedPercent ?? "—"}% soutenu`);
  const multitasking = bestBy(phone => `${phone.os} · ${phone.performance.ramGB} Go`, multitaskingScore, phone => `barème ${phone.os}`);
  const autonomy = bestBy(phone => `${phone.battery.activeUseHours ?? "—"} h actives`, autonomyScore, phone => `${phone.battery.capacityMah.toLocaleString("fr-FR")} mAh · ${phone.battery.autonomyBasis}`);
  const charging = bestBy(phone => `${phone.battery.chargeMinutes ?? "—"} min · ${phone.battery.wiredW} W`, chargingScore, phone => `${phone.battery.wirelessW} W sans fil`);
  const camera: IndexItem[] = [
    { label: "Photo", score: scales.camera.subWeights.photo, detail: "55 % du score caméra" },
    { label: "Vidéo", score: scales.camera.subWeights.video, detail: "30 % du score caméra" },
    { label: "Selfie", score: scales.camera.subWeights.selfie, detail: "15 % du score caméra" },
    ...points(scales.camera.opticalZoom, "×", "repère matériel zoom"),
  ];
  const screen = bestBy(phone => `${Math.round(Math.sqrt(phone.screen.widthPx ** 2 + phone.screen.heightPx ** 2) / phone.screen.diagonal)} ppp · ${phone.screen.refreshHz} Hz`, screenScore, phone => `${phone.screen.brightnessNits} nits ${phone.screen.brightnessBasis.toLowerCase()}`);
  const durability = bestBy(phone => `${phone.durability.ip} · réparabilité ${phone.durability.repairabilityScore ?? "—"}`, durabilityScore, phone => phone.durability.dropMeters ? `chute ${phone.durability.dropMeters} m` : "chute non documentée");
  const storage = bestBy(phone => `${phone.performance.storage.capacityGB} Go · ${phone.performance.storage.type}`, storageScore, phone => phone.performance.storage.expandable ? "extensible" : "non extensible");

  return (
    <section className="indices-section">
      <div className="indices-heading"><div><span className="eyebrow"><Gauge /> Barèmes vérifiables</span><h2>Comprendre les huit indices</h2></div><p>Les sous-scores utilisent les mêmes courbes pour tout le catalogue. Les mesures absentes restent inconnues et les estimations sont signalées dans chaque fiche.</p></div>
      <div className="indices-grid all-scales">
        <IndexCard title="Performances" icon={<Cpu />} items={performance} />
        <IndexCard title="Multitâche / RAM" icon={<MemoryStick />} items={multitasking} />
        <IndexCard title="Autonomie" icon={<Gauge />} items={autonomy} />
        <IndexCard title="Recharge" icon={<BatteryCharging />} items={charging} />
        <IndexCard title="Caméra" icon={<Camera />} items={camera} />
        <IndexCard title="Écran" icon={<MonitorSmartphone />} items={screen} />
        <IndexCard title="Résistance" icon={<ShieldCheck />} items={durability} />
        <IndexCard title="Stockage" icon={<Database />} items={storage} />
      </div>
      <p className="method-note"><Info /> L’autonomie privilégie les heures d’usage actif (70 %), puis la capacité (20 %) et les cycles de batterie (10 %). Le niveau de confiance n’ajoute ni ne retire de points : il indique seulement la fiabilité des données.</p>
    </section>
  );
}

import { BatteryCharging, Camera, Cpu, Gauge, Info, MemoryStick, MonitorSmartphone, ShieldCheck } from "lucide-react";
import scales from "@/data/scales.json";
import { PHONES } from "@/lib/catalog";
import { capacityScore, cpuScore, ramScore } from "@/lib/scoring";
import { IndexCard, type IndexItem } from "./index-card";

const scoreItems = (items: Array<[string, number]>, detail: string): IndexItem[] => items.map(([label, score]) => ({ label, score, detail }));

export function BenchmarkSection() {
  const battery = Array.from(new Set(PHONES.map((phone) => phone.battery.capacityMah))).sort((a, b) => b - a)
    .map((capacity) => ({ label: `${capacity.toLocaleString("fr-FR")} mAh`, score: capacityScore(capacity), detail: `${PHONES.filter((phone) => phone.battery.capacityMah === capacity).length} modèle(s)` }));
  const cpu = Array.from(new Set(PHONES.map((phone) => phone.performance.chipset))).map((chipset) => {
    const phone = PHONES.filter((item) => item.performance.chipset === chipset).sort((a, b) => b.performance.antutu - a.performance.antutu)[0];
    return { label: chipset, score: cpuScore(phone), detail: `${(phone.performance.antutu / 1_000_000).toFixed(2)} M AnTuTu` };
  }).sort((a, b) => b.score - a.score);
  const ram = Array.from(new Set(PHONES.map((phone) => phone.performance.ramGB))).sort((a, b) => b - a)
    .map((value) => ({ label: `${value} Go`, score: ramScore(value), detail: "mémoire vive" }));
  const camera = scoreItems([
    ...scales.camera.mainMegapixels.map(([value, score]) => [`Principal ${value} Mpx`, score] as [string, number]),
    ["Zoom optique 3×", 65], ["Zoom optique 5×", 100], ["Stabilisation OIS", 100],
  ], "repère caméra");
  const screen = scoreItems([
    ...scales.screen.refreshRate.map(([value, score]) => [`${value} Hz`, score] as [string, number]),
    ["1 800 nits", 80], ["2 500 nits", 91], ["AMOLED", scales.screen.panelScores.AMOLED],
  ], "repère écran");
  const durability = scoreItems([
    ["IP65", scales.durability.ipScores.IP65], ["IP68", scales.durability.ipScores.IP68], ["IP69", scales.durability.ipScores.IP69], ["IP69K", scales.durability.ipScores.IP69K],
    ...scales.durability.dropMeters.slice(1).map(([value, score]) => [`Chute ${value} m`, score] as [string, number]),
    ["Verre Premium", scales.durability.glassScores.Premium], ["Verre certifié chutes", scales.durability.glassScores["Certifié chutes"]],
  ], "repère résistance");

  return (
    <section className="indices-section">
      <div className="indices-heading"><div><span className="eyebrow"><Gauge /> Barèmes vérifiables</span><h2>Comprendre chaque indice</h2></div><p>Toutes les références viennent de <code>data/scales.json</code>. Les valeurs intermédiaires sont interpolées entre les repères.</p></div>
      <div className="indices-grid all-scales">
        <IndexCard title="Batteries" icon={<BatteryCharging />} items={battery} />
        <IndexCard title="Processeurs" icon={<Cpu />} items={cpu} />
        <IndexCard title="Mémoires RAM" icon={<MemoryStick />} items={ram} />
        <IndexCard title="Caméras" icon={<Camera />} items={camera} />
        <IndexCard title="Écrans" icon={<MonitorSmartphone />} items={screen} />
        <IndexCard title="Résistance" icon={<ShieldCheck />} items={durability} />
      </div>
      <p className="method-note"><Info /> Avec Batterie à 100 %, le classement repose uniquement sur la capacité : 11 000 mAh devance toujours 10 000 mAh. La puissance de charge reste affichée comme caractéristique informative.</p>
    </section>
  );
}

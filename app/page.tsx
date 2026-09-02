"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  Activity, BatteryCharging, Camera, ChevronRight, Cpu, ExternalLink,
  Gauge, Info, Medal, MemoryStick, MonitorSmartphone, Pencil, Plus, RotateCcw,
  Search, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { EMPTY_PHONE, INITIAL_PHONES } from "@/lib/phones";
import { InstallPWA } from "@/app/install-pwa";
import {
  DEFAULT_WEIGHTS, capacityScore, cpuScore, ramScore, scorePhone, type Phone, type Weights,
} from "@/lib/scoring";

const weightMeta = {
  cpu: { label: "Performance CPU", icon: Cpu, color: "#7757ff" },
  ram: { label: "Mémoire RAM", icon: MemoryStick, color: "#b652cc" },
  battery: { label: "Batterie", icon: BatteryCharging, color: "#21b47e" },
  camera: { label: "Caméra", icon: Camera, color: "#f05d52" },
  screen: { label: "Écran", icon: MonitorSmartphone, color: "#1f8fd1" },
  durability: { label: "Résistance", icon: ShieldCheck, color: "#e89b2c" },
} as const;

const presets: Array<{ label: string; weights: Weights }> = [
  { label: "Équilibré", weights: DEFAULT_WEIGHTS },
  { label: "Autonomie", weights: { cpu: 10, ram: 5, battery: 45, camera: 15, screen: 15, durability: 10 } },
  { label: "Photo", weights: { cpu: 10, ram: 5, battery: 15, camera: 50, screen: 15, durability: 5 } },
  { label: "Gaming", weights: { cpu: 35, ram: 15, battery: 25, camera: 5, screen: 15, durability: 5 } },
  { label: "Robuste", weights: { cpu: 10, ram: 5, battery: 25, camera: 10, screen: 10, durability: 40 } },
];

type RankedPhone = Phone & ReturnType<typeof scorePhone> & { rank: number };
const number = (value: string) => Number(value) || 0;
const oneDecimal = (value: number) => value.toFixed(1).replace(".0", "");

function updateWeightKeepingTotal(weights: Weights, key: keyof Weights, nextValue: number): Weights {
  const keys = Object.keys(weights) as Array<keyof Weights>;
  const others = keys.filter((item) => item !== key);
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

function ScoreRing({ value, rank }: { value: number; rank?: number }) {
  return (
    <div className="score-ring" style={{ "--score": `${value * 3.6}deg` } as CSSProperties}>
      <div><strong>{oneDecimal(value)}</strong><span>{rank ? `#${rank}` : "/ 100"}</span></div>
    </div>
  );
}

function CategoryBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="category-bar">
      <div><span>{label}</span><strong>{oneDecimal(value)}</strong></div>
      <div className="bar-track"><span style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}

function NumberField({ label, value, onChange, suffix, min = 0, step = 1 }: {
  label: string; value: number; onChange: (value: number) => void; suffix?: string; min?: number; step?: number;
}) {
  return (
    <div className="field-group">
      <Label>{label}</Label>
      <div className="input-suffix">
        <Input type="number" min={min} step={step} value={value} onChange={(event) => onChange(number(event.target.value))} />
        {suffix && <span>{suffix}</span>}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="field-group"><Label>{label}</Label><Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function IndexCard({ title, icon, items }: {
  title: string;
  icon: ReactNode;
  items: Array<{ label: string; score: number; detail: string }>;
}) {
  return (
    <article className="index-card">
      <div className="index-card-title">{icon}<h3>{title}</h3><span>{items.length}</span></div>
      <div className="index-list">
        {items.map((item) => (
          <div className="index-row" key={item.label}>
            <div><strong>{item.label}</strong><small>{item.detail}</small></div>
            <div className="index-meter"><span style={{ width: `${item.score}%` }} /></div>
            <b>{oneDecimal(item.score)}</b>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Home() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [phones, setPhones] = useState<Phone[]>(INITIAL_PHONES);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RankedPhone | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<Phone>(structuredClone(EMPTY_PHONE));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedWeights = localStorage.getItem("smartphone-score:weights");
      const savedPhones = localStorage.getItem("smartphone-score:phones");
      if (savedWeights) {
        const parsed = JSON.parse(savedWeights);
        if (["cpu", "ram", "battery", "camera", "screen", "durability"].every((key) => Number.isFinite(parsed[key]))) setWeights(parsed);
      }
      if (savedPhones) setPhones(JSON.parse(savedPhones));
    } catch { /* Ignore malformed local preferences. */ }
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem("smartphone-score:weights", JSON.stringify(weights)); }, [weights, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem("smartphone-score:phones", JSON.stringify(phones)); }, [phones, hydrated]);

  const ranked = useMemo<RankedPhone[]>(() => phones
    .map((phone) => ({ ...phone, ...scorePhone(phone, weights) }))
    .sort((a, b) => b.total - a.total)
    .map((phone, index) => ({ ...phone, rank: index + 1 })), [phones, weights]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? ranked.filter((phone) => `${phone.name} ${phone.brand} ${phone.performance.chipset}`.toLowerCase().includes(normalized)) : ranked;
  }, [ranked, query]);

  const openNewPhone = () => { setEditingId(null); setDraft(structuredClone(EMPTY_PHONE)); setEditorOpen(true); };
  const openEditPhone = (phone: Phone) => { setSelected(null); setEditingId(phone.id); setDraft(structuredClone(phone)); setEditorOpen(true); };
  const savePhone = () => {
    if (!draft.name.trim() || !draft.brand.trim() || !draft.performance.chipset.trim()) return;
    const item = { ...draft, id: editingId ?? `${draft.brand}-${draft.name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") };
    setPhones((current) => editingId ? current.map((phone) => phone.id === editingId ? item : phone) : [...current, item]);
    setEditorOpen(false);
  };
  const resetAll = () => { setWeights(DEFAULT_WEIGHTS); setPhones(INITIAL_PHONES); };
  const topThree = ranked.slice(0, 3);
  const batteryIndices = useMemo(() => Array.from(new Set(phones.map((phone) => phone.battery.capacityMah)))
    .sort((a, b) => b - a)
    .map((capacity) => ({ label: `${capacity.toLocaleString("fr-FR")} mAh`, score: capacityScore(capacity), count: phones.filter((phone) => phone.battery.capacityMah === capacity).length })), [phones]);
  const cpuIndices = useMemo(() => Array.from(new Set(phones.map((phone) => phone.performance.chipset)))
    .map((chipset) => {
      const matches = phones.filter((phone) => phone.performance.chipset === chipset);
      const best = matches.reduce((winner, phone) => phone.performance.antutu > winner.performance.antutu ? phone : winner);
      return { label: chipset, score: cpuScore(best), detail: `${(best.performance.antutu / 1000000).toFixed(2)} M pts` };
    }).sort((a, b) => b.score - a.score), [phones]);
  const ramIndices = useMemo(() => Array.from(new Set(phones.map((phone) => phone.performance.ramGB)))
    .sort((a, b) => b - a)
    .map((ram) => ({ label: `${ram} Go`, score: ramScore(ram), detail: "mémoire vive" })), [phones]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark"><Gauge /></div><div><strong>Smartphone Score</strong><span>Comparateur multicritère</span></div></div>
        <div className="topbar-actions"><InstallPWA /><Button onClick={openNewPhone} className="add-button"><Plus /> Ajouter un téléphone</Button></div>
      </header>

      <section className="workspace">
        <aside className="weight-panel">
          <div className="panel-heading"><div><SlidersHorizontal /><span>Vos priorités</span></div><span className="total-pill">100 %</span></div>
          <p className="panel-copy">Déplacez un curseur : les autres poids s’ajustent automatiquement et le classement se recalcule.</p>
          <div className="weights-list">
            {(Object.keys(weightMeta) as Array<keyof Weights>).map((key) => {
              const meta = weightMeta[key]; const Icon = meta.icon;
              return (
                <div className="weight-control" key={key} style={{ "--criterion": meta.color } as CSSProperties}>
                  <div className="weight-label"><span><Icon />{meta.label}</span><strong>{oneDecimal(weights[key])}%</strong></div>
                  <Slider value={[weights[key]]} min={0} max={70} step={1} aria-label={`Poids ${meta.label}`} onValueChange={(value) => setWeights((current) => updateWeightKeepingTotal(current, key, value[0]))} />
                </div>
              );
            })}
          </div>
          <div className="preset-block"><span>Profils rapides</span><div className="preset-grid">{presets.map((preset) => <button key={preset.label} onClick={() => setWeights(preset.weights)}>{preset.label}</button>)}</div></div>
          <div className="formula-note"><Info /><p><strong>Calcul transparent</strong>Chaque indice vient des caractéristiques, puis vos six priorités sont appliquées au score final.</p></div>
          <Button variant="ghost" className="reset-button" onClick={resetAll}><RotateCcw /> Réinitialiser</Button>
        </aside>

        <div className="results-panel">
          <div className="results-heading"><div><span className="eyebrow"><Activity /> Classement en direct</span><h1>Votre meilleur smartphone, selon vos règles.</h1></div><div className="catalog-count"><strong>{phones.length}</strong><span>modèles analysés</span></div></div>
          <div className="podium-grid">
            {topThree.map((phone, index) => (
              <article className={`podium-card rank-${index + 1}`} key={phone.id}>
                <div className="podium-top"><span className="rank-badge">{index === 0 ? <Trophy /> : <Medal />} #{phone.rank}</span><span className="market-badge">{phone.market}</span></div>
                <div className="podium-main"><div><span className="brand-name">{phone.brand}</span><h2>{phone.name}</h2><p>{phone.performance.chipset}</p></div><ScoreRing value={phone.total} /></div>
                <div className="mini-specs"><span><BatteryCharging />{phone.battery.capacityMah.toLocaleString("fr-FR")} mAh</span><span><Camera />{phone.camera.mainMP} Mpx{phone.camera.teleZoom ? ` · ${phone.camera.teleZoom}×` : ""}</span><span><MonitorSmartphone />{phone.screen.refreshHz} Hz</span></div>
                <button className="detail-link" onClick={() => setSelected(phone)}>Voir le détail <ChevronRight /></button>
              </article>
            ))}
          </div>

          <section className="ranking-section">
            <div className="ranking-toolbar"><div><h2>Classement complet</h2><span>Mise à jour instantanée</span></div><div className="search-box"><Search /><Input aria-label="Rechercher un téléphone" placeholder="Rechercher un modèle…" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
            <div className="ranking-list">
              {filtered.map((phone) => (
                <article className="ranking-row" key={phone.id}>
                  <div className={`row-rank ${phone.rank <= 3 ? "is-top" : ""}`}>{phone.rank}</div>
                  <div className="phone-identity"><strong>{phone.name}</strong><span>{phone.performance.chipset} · {phone.battery.capacityMah.toLocaleString("fr-FR")} mAh</span></div>
                  <div className="score-chips">{(Object.keys(weightMeta) as Array<keyof Weights>).map((key) => <span key={key} title={weightMeta[key].label} style={{ "--chip": weightMeta[key].color } as CSSProperties}>{oneDecimal(phone.categoryScores[key])}</span>)}</div>
                  <div className="row-score"><strong>{oneDecimal(phone.total)}</strong><span>/100</span></div>
                  <Button variant="ghost" size="icon" aria-label={`Voir ${phone.name}`} onClick={() => setSelected(phone)}><ChevronRight /></Button>
                </article>
              ))}
              {!filtered.length && <div className="empty-state"><Search /><strong>Aucun modèle trouvé</strong><span>Essayez un autre nom ou ajoutez ce téléphone.</span></div>}
            </div>
            <div className="legend">{(Object.keys(weightMeta) as Array<keyof Weights>).map((key) => <span key={key}><i style={{ background: weightMeta[key].color }} />{weightMeta[key].label}</span>)}</div>
          </section>

          <section className="indices-section">
            <div className="indices-heading"><div><span className="eyebrow"><Gauge /> Barèmes vérifiables</span><h2>Comprendre chaque indice</h2></div><p>Les valeurs intermédiaires sont interpolées entre les repères. Les nouveaux téléphones rejoignent automatiquement ces listes.</p></div>
            <div className="indices-grid">
              <IndexCard title="Batteries du catalogue" icon={<BatteryCharging />} items={batteryIndices.map((item) => ({ label: item.label, score: item.score, detail: `${item.count} modèle${item.count > 1 ? "s" : ""}` }))} />
              <IndexCard title="Processeurs du catalogue" icon={<Cpu />} items={cpuIndices} />
              <IndexCard title="Mémoires RAM" icon={<MemoryStick />} items={ramIndices} />
            </div>
            <p className="method-note"><Info /> Repères principaux : 7 000 et 8 000 mAh = 80, 10 000 mAh = 95 · 12 Go RAM = 90, 16 Go = 95 · Snapdragon 8 Elite ≈ 90. Batterie inclut aussi la charge et la technologie ; le CPU s’appuie sur le benchmark saisi.</p>
          </section>
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="detail-dialog">
          {selected && <>
            <DialogHeader><DialogDescription>{selected.brand} · {selected.release} · {selected.market}</DialogDescription><DialogTitle>{selected.name}</DialogTitle></DialogHeader>
            <div className="detail-hero"><ScoreRing value={selected.total} rank={selected.rank} /><div><span>Score personnalisé</span><strong>{oneDecimal(selected.total)} / 100</strong><p>Calculé avec vos pondérations actuelles.</p></div></div>
            <div className="category-grid">{(Object.keys(weightMeta) as Array<keyof Weights>).map((key) => <CategoryBar key={key} label={weightMeta[key].label} value={selected.categoryScores[key]} color={weightMeta[key].color} />)}</div>
            <div className="spec-grid">
              <div><Cpu /><span>CPU · indice {oneDecimal(selected.categoryScores.cpu)}</span><strong>{selected.performance.chipset}</strong><small>{(selected.performance.antutu / 1000000).toFixed(2)} M AnTuTu · {selected.performance.storage} · {selected.performance.cooling}</small></div>
              <div><MemoryStick /><span>RAM · indice {oneDecimal(selected.categoryScores.ram)}</span><strong>{selected.performance.ramGB} Go</strong><small>Évaluée séparément pour respecter votre priorité mémoire.</small></div>
              <div><BatteryCharging /><span>Batterie</span><strong>{selected.battery.capacityMah.toLocaleString("fr-FR")} mAh</strong><small>{selected.battery.wiredW} W filaire · {selected.battery.wirelessW || 0} W sans fil · capacité {oneDecimal(capacityScore(selected.battery.capacityMah))}/100</small></div>
              <div><Camera /><span>Caméra</span><strong>{selected.camera.mainMP} Mpx principal</strong><small>{selected.camera.ultrawideMP || 0} Mpx ultra grand-angle · zoom {selected.camera.teleZoom || 0}× · {selected.camera.ois ? "OIS" : "sans OIS"}</small></div>
              <div><MonitorSmartphone /><span>Écran</span><strong>{selected.screen.diagonal}″ {selected.screen.panel}</strong><small>{selected.screen.widthPx} × {selected.screen.heightPx} · {selected.screen.refreshHz} Hz · {selected.screen.ltpo ? "LTPO" : "rafraîchissement fixe"}</small></div>
              <div><ShieldCheck /><span>Résistance</span><strong>{selected.durability.ip}</strong><small>{selected.durability.label || `Chute documentée : ${selected.durability.dropMeters} m`}</small></div>
            </div>
            <DialogFooter className="detail-actions">{selected.sourceUrl && <Button variant="outline" asChild><a href={selected.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> Source</a></Button>}<Button onClick={() => openEditPhone(selected)}><Pencil /> Modifier la fiche</Button></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="editor-dialog">
          <DialogHeader><DialogDescription>Les six indices sont calculés automatiquement à partir des données saisies.</DialogDescription><DialogTitle>{editingId ? "Modifier le téléphone" : "Ajouter un téléphone"}</DialogTitle></DialogHeader>
          <div className="editor-scroll">
            <section className="form-section"><h3><Smartphone /> Identité</h3><div className="form-grid three">
              <TextField label="Marque *" value={draft.brand} onChange={(value) => setDraft({ ...draft, brand: value })} placeholder="Ex. HONOR" />
              <TextField label="Modèle *" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} placeholder="Ex. Magic8 Pro" />
              <TextField label="Marché" value={draft.market} onChange={(value) => setDraft({ ...draft, market: value })} />
              <TextField label="Date de sortie" value={draft.release} onChange={(value) => setDraft({ ...draft, release: value })} />
              <div className="wide-field"><TextField label="Lien de la source" value={draft.sourceUrl ?? ""} onChange={(value) => setDraft({ ...draft, sourceUrl: value })} placeholder="https://…" /></div>
            </div></section>

            <section className="form-section purple"><h3><Cpu /> CPU et mémoire</h3><div className="form-grid">
              <div className="wide-field"><TextField label="Processeur *" value={draft.performance.chipset} onChange={(value) => setDraft({ ...draft, performance: { ...draft.performance, chipset: value } })} /></div>
              <NumberField label="Score AnTuTu" value={draft.performance.antutu} onChange={(value) => setDraft({ ...draft, performance: { ...draft.performance, antutu: value } })} />
              <NumberField label="Mémoire RAM" suffix="Go" value={draft.performance.ramGB} onChange={(value) => setDraft({ ...draft, performance: { ...draft.performance, ramGB: value } })} />
              <SelectField label="Stockage" value={draft.performance.storage} values={["UFS 2.2", "UFS 3.1", "UFS 4.0", "UFS 4.1"]} onChange={(value) => setDraft({ ...draft, performance: { ...draft.performance, storage: value as Phone["performance"]["storage"] } })} />
              <SelectField label="Refroidissement" value={draft.performance.cooling} values={["Standard", "Chambre à vapeur", "Refroidissement actif"]} onChange={(value) => setDraft({ ...draft, performance: { ...draft.performance, cooling: value as Phone["performance"]["cooling"] } })} />
              <div className="capacity-preview purple-preview"><span>Indices calculés</span><strong>CPU {oneDecimal(cpuScore(draft))} · RAM {oneDecimal(ramScore(draft.performance.ramGB))}</strong><small>Snapdragon 8 Elite ≈ 90 · 12 Go = 90 · 16 Go = 95</small></div>
            </div></section>

            <section className="form-section green"><h3><BatteryCharging /> Batterie</h3><div className="form-grid three">
              <NumberField label="Capacité" suffix="mAh" value={draft.battery.capacityMah} onChange={(value) => setDraft({ ...draft, battery: { ...draft.battery, capacityMah: value } })} />
              <NumberField label="Charge filaire" suffix="W" value={draft.battery.wiredW} onChange={(value) => setDraft({ ...draft, battery: { ...draft.battery, wiredW: value } })} />
              <NumberField label="Charge sans fil" suffix="W" value={draft.battery.wirelessW} onChange={(value) => setDraft({ ...draft, battery: { ...draft.battery, wirelessW: value } })} />
              <SelectField label="Technologie" value={draft.battery.technology} values={["Lithium-ion", "Silicium-carbone"]} onChange={(value) => setDraft({ ...draft, battery: { ...draft.battery, technology: value as Phone["battery"]["technology"] } })} />
              <div className="capacity-preview"><span>Indice capacité</span><strong>{oneDecimal(capacityScore(draft.battery.capacityMah))}/100</strong><small>7 000 = 80 · 8 000 = 80 · 10 000 mAh = 95</small></div>
            </div></section>

            <section className="form-section coral"><h3><Camera /> Caméra</h3><div className="form-grid three">
              <NumberField label="Capteur principal" suffix="Mpx" value={draft.camera.mainMP} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, mainMP: value } })} />
              <NumberField label="Taille capteur 1/x" step={0.01} value={draft.camera.sensorDenominator} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, sensorDenominator: value } })} />
              <NumberField label="Ultra grand-angle" suffix="Mpx" value={draft.camera.ultrawideMP} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, ultrawideMP: value } })} />
              <NumberField label="Zoom optique" suffix="×" step={0.1} value={draft.camera.teleZoom} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, teleZoom: value } })} />
              <NumberField label="Caméra avant" suffix="Mpx" value={draft.camera.selfieMP} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, selfieMP: value } })} />
              <NumberField label="Vidéo maximale" suffix="K" value={draft.camera.videoK} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, videoK: value } })} />
              <NumberField label="Images/seconde" suffix="fps" value={draft.camera.videoFps} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, videoFps: value } })} />
              <NumberField label="DXOMARK facultatif" value={draft.camera.dxomark} onChange={(value) => setDraft({ ...draft, camera: { ...draft.camera, dxomark: value } })} />
              <div className="check-field"><Checkbox id="ois" checked={draft.camera.ois} onCheckedChange={(checked) => setDraft({ ...draft, camera: { ...draft.camera, ois: checked === true } })} /><Label htmlFor="ois">Stabilisation optique OIS</Label></div>
            </div></section>

            <section className="form-section blue"><h3><MonitorSmartphone /> Écran</h3><div className="form-grid three">
              <NumberField label="Diagonale" suffix="pouces" step={0.01} value={draft.screen.diagonal} onChange={(value) => setDraft({ ...draft, screen: { ...draft.screen, diagonal: value } })} />
              <NumberField label="Largeur" suffix="px" value={draft.screen.widthPx} onChange={(value) => setDraft({ ...draft, screen: { ...draft.screen, widthPx: value } })} />
              <NumberField label="Hauteur" suffix="px" value={draft.screen.heightPx} onChange={(value) => setDraft({ ...draft, screen: { ...draft.screen, heightPx: value } })} />
              <NumberField label="Rafraîchissement" suffix="Hz" value={draft.screen.refreshHz} onChange={(value) => setDraft({ ...draft, screen: { ...draft.screen, refreshHz: value } })} />
              <NumberField label="Luminosité utile" suffix="nits" value={draft.screen.brightnessNits} onChange={(value) => setDraft({ ...draft, screen: { ...draft.screen, brightnessNits: value } })} />
              <SelectField label="Type de dalle" value={draft.screen.panel} values={["LCD", "OLED", "AMOLED"]} onChange={(value) => setDraft({ ...draft, screen: { ...draft.screen, panel: value as Phone["screen"]["panel"] } })} />
              <div className="check-field"><Checkbox id="ltpo" checked={draft.screen.ltpo} onCheckedChange={(checked) => setDraft({ ...draft, screen: { ...draft.screen, ltpo: checked === true } })} /><Label htmlFor="ltpo">Rafraîchissement adaptatif LTPO</Label></div>
            </div></section>

            <section className="form-section amber"><h3><ShieldCheck /> Résistance et chutes</h3><div className="form-grid three">
              <SelectField label="Indice IP" value={draft.durability.ip} values={["Aucune", "IP65", "IP68", "IP69", "IP69K", "IPX8"]} onChange={(value) => setDraft({ ...draft, durability: { ...draft.durability, ip: value as Phone["durability"]["ip"] } })} />
              <NumberField label="Hauteur de chute documentée" suffix="m" step={0.1} value={draft.durability.dropMeters} onChange={(value) => setDraft({ ...draft, durability: { ...draft.durability, dropMeters: value } })} />
              <SelectField label="Protection du verre" value={draft.durability.glass} values={["Standard", "Renforcé", "Premium", "Certifié chutes"]} onChange={(value) => setDraft({ ...draft, durability: { ...draft.durability, glass: value as Phone["durability"]["glass"] } })} />
              <div className="wide-field"><TextField label="Certification ou protection" value={draft.durability.label} onChange={(value) => setDraft({ ...draft, durability: { ...draft.durability, label: value } })} placeholder="Ex. SGS 5 étoiles, Gorilla Glass Victus 2…" /></div>
            </div></section>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditorOpen(false)}>Annuler</Button><Button onClick={savePhone} disabled={!draft.name.trim() || !draft.brand.trim() || !draft.performance.chipset.trim()}><Sparkles /> {editingId ? "Enregistrer" : "Ajouter au classement"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function SelectField({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <div className="field-group"><Label>{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{values.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>;
}

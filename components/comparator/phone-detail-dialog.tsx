import { BatteryCharging, Camera, Cpu, Database, ExternalLink, Gauge, Info, MemoryStick, MonitorSmartphone, ShieldCheck, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CRITERIA, criterionKeys, formatScore } from "@/lib/config";
import { cameraPhotoScore, ppi } from "@/lib/scoring";
import type { RankedPhone } from "@/lib/types";
import { ScoreRing } from "./score-ring";

function CategoryBar({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="category-bar"><div><span>{label}</span><strong>{formatScore(value)}</strong></div><div className="bar-track"><span style={{ width: `${value}%`, background: color }} /></div></div>;
}

export function PhoneDetailDialog({ phone, onClose }: { phone: RankedPhone | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(phone)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="detail-dialog">
        {phone && <>
          <DialogHeader><DialogDescription>{phone.brand} · {phone.release} · {phone.market}</DialogDescription><DialogTitle>{phone.name}</DialogTitle></DialogHeader>
          <div className="detail-hero"><ScoreRing value={phone.total} rank={phone.rank} /><div><span>Score personnalisé</span><strong>{formatScore(phone.total)} / 100</strong><p>Confiance {phone.confidence}% · top 3 dans {phone.stability}% des pondérations voisines</p></div></div>
          <div className="category-grid">{criterionKeys.map((key) => <CategoryBar key={key} label={CRITERIA[key].label} value={phone.categoryScores[key]} color={CRITERIA[key].color} />)}</div>
          <div className="spec-grid">
            <div><Cpu /><span>Performance · {formatScore(phone.categoryScores.performance)}</span><strong>{phone.performance.chipset}</strong><small>{phone.performance.antutu ? `${(phone.performance.antutu / 1_000_000).toFixed(2)} M AnTuTu` : "Benchmark absent"} · stabilité {phone.performance.sustainedPercent ?? "—"}% · {phone.performance.cooling}</small></div>
            <div><MemoryStick /><span>Multitâche · {formatScore(phone.categoryScores.multitasking)}</span><strong>{phone.performance.ramGB} Go de RAM</strong><small>Barème {phone.os} spécifique pour éviter une comparaison brute iOS/Android.</small></div>
            <div><Gauge /><span>Autonomie · {formatScore(phone.categoryScores.autonomy)}</span><strong>{phone.battery.activeUseHours ?? "—"} h actives</strong><small>{phone.battery.capacityMah.toLocaleString("fr-FR")} mAh · {phone.battery.cyclesTo80 ?? "—"} cycles à 80 % · {phone.battery.autonomyBasis}</small></div>
            <div><BatteryCharging /><span>Recharge · {formatScore(phone.categoryScores.charging)}</span><strong>{phone.battery.chargeMinutes ?? "—"} min estimées</strong><small>{phone.battery.wiredW} W filaire · {phone.battery.wirelessW} W sans fil · {phone.battery.technology}</small></div>
            <div><Camera /><span>Caméra · {formatScore(phone.categoryScores.camera)}</span><strong>Photo {formatScore(cameraPhotoScore(phone))} · Vidéo {formatScore(phone.camera.videoIndex)}</strong><small>Selfie {formatScore(phone.camera.selfieIndex)} · {phone.camera.mainMP} Mpx · zoom {phone.camera.teleZoom || 0}× · {phone.camera.qualityBasis}{phone.camera.dxomarkProtocol ? ` · DXOMARK ${phone.camera.dxomarkProtocol} normalisé` : ""}</small></div>
            <div><MonitorSmartphone /><span>Écran · {formatScore(phone.categoryScores.screen)}</span><strong>{phone.screen.diagonal}″ {phone.screen.panel} · {Math.round(ppi(phone))} ppp</strong><small>{phone.screen.widthPx} × {phone.screen.heightPx} · {phone.screen.refreshHz} Hz · {phone.screen.brightnessNits} nits {phone.screen.brightnessBasis.toLowerCase()}</small></div>
            <div><ShieldCheck /><span>Résistance · {formatScore(phone.categoryScores.durability)}</span><strong>{phone.durability.ip} · réparabilité {phone.durability.repairabilityScore ?? "—"}/100</strong><small>{phone.durability.label} · chute {phone.durability.dropMeters ? `${phone.durability.dropMeters} m` : "non documentée"}</small></div>
            <div><Database /><span>Stockage · {formatScore(phone.categoryScores.storage)}</span><strong>{phone.performance.storage.capacityGB} Go · {phone.performance.storage.type}</strong><small>{phone.performance.storage.expandable ? "Extension microSD disponible" : "Stockage non extensible"}</small></div>
            <div><Signal /><span>Connectivité</span><strong>{phone.connectivity.network} · {phone.connectivity.esim ? "eSIM" : "sans eSIM"}</strong><small>{phone.connectivity.dualSim ? "Double SIM" : "Simple SIM"}</small></div>
          </div>
          {phone.estimatedFields.length ? <p className="data-note"><Info /><span><strong>Données mixtes :</strong> {phone.estimatedFields.join(", ")}. Ces estimations diminuent l’indice de confiance mais ne sont jamais cachées.</span></p> : null}
          <DialogFooter className="detail-actions">{phone.sources.map((source) => <Button variant="outline" size="sm" asChild key={source.url}><a href={source.url} target="_blank" rel="noreferrer"><ExternalLink /> {source.label}</a></Button>)}</DialogFooter>
        </>}
      </DialogContent>
    </Dialog>
  );
}

import { BatteryCharging, Camera, Cpu, ExternalLink, MemoryStick, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CRITERIA, criterionKeys, formatScore } from "@/lib/config";
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
          <div className="detail-hero"><ScoreRing value={phone.total} rank={phone.rank} /><div><span>Score personnalisé</span><strong>{formatScore(phone.total)} / 100</strong><p>Calculé avec vos pondérations actuelles.</p></div></div>
          <div className="category-grid">{criterionKeys.map((key) => <CategoryBar key={key} label={CRITERIA[key].label} value={phone.categoryScores[key]} color={CRITERIA[key].color} />)}</div>
          <div className="spec-grid">
            <div><Cpu /><span>CPU · indice {formatScore(phone.categoryScores.cpu)}</span><strong>{phone.performance.chipset}</strong><small>{(phone.performance.antutu / 1_000_000).toFixed(2)} M AnTuTu · {phone.performance.storage} · {phone.performance.cooling}</small></div>
            <div><MemoryStick /><span>RAM · indice {formatScore(phone.categoryScores.ram)}</span><strong>{phone.performance.ramGB} Go</strong><small>Mémoire vive évaluée séparément.</small></div>
            <div><BatteryCharging /><span>Batterie · indice {formatScore(phone.categoryScores.battery)}</span><strong>{phone.battery.capacityMah.toLocaleString("fr-FR")} mAh</strong><small>{phone.battery.wiredW} W filaire · {phone.battery.wirelessW || 0} W sans fil · {phone.battery.technology}</small></div>
            <div><Camera /><span>Caméra</span><strong>{phone.camera.mainMP} Mpx principal</strong><small>{phone.camera.ultrawideMP || 0} Mpx ultra grand-angle · zoom {phone.camera.teleZoom || 0}× · {phone.camera.ois ? "OIS" : "sans OIS"}</small></div>
            <div><MonitorSmartphone /><span>Écran</span><strong>{phone.screen.diagonal}″ {phone.screen.panel}</strong><small>{phone.screen.widthPx} × {phone.screen.heightPx} · {phone.screen.refreshHz} Hz · {phone.screen.brightnessNits} nits</small></div>
            <div><ShieldCheck /><span>Résistance</span><strong>{phone.durability.ip}</strong><small>{phone.durability.label || `Chute documentée : ${phone.durability.dropMeters} m`}</small></div>
          </div>
          {phone.sourceUrl && <DialogFooter className="detail-actions"><Button variant="outline" asChild><a href={phone.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink /> Consulter la source</a></Button></DialogFooter>}
        </>}
      </DialogContent>
    </Dialog>
  );
}

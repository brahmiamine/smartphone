import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CRITERIA, criterionKeys, formatScore } from "@/lib/config";
import type { RankedPhone } from "@/lib/types";

export function ComparisonDialog({ phones, open, onOpenChange }: { phones: RankedPhone[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="comparison-dialog">
        <DialogHeader><DialogDescription>Comparaison limitée aux modèles sélectionnés</DialogDescription><DialogTitle>Comparer {phones.length} smartphones</DialogTitle></DialogHeader>
        <div className="comparison-scroll">
          <table className="comparison-table">
            <thead><tr><th>Critère</th>{phones.map((phone) => <th key={phone.id}><span>#{phone.rank}</span>{phone.name}</th>)}</tr></thead>
            <tbody>
              <tr className="total-row"><th>Score final</th>{phones.map((phone) => <td key={phone.id}><strong>{formatScore(phone.total)}</strong>/100</td>)}</tr>
              {criterionKeys.map((key) => <tr key={key}><th><i style={{ background: CRITERIA[key].color }} />{CRITERIA[key].label}</th>{phones.map((phone) => <td key={phone.id}>{formatScore(phone.categoryScores[key])}</td>)}</tr>)}
              <tr><th>Processeur</th>{phones.map((phone) => <td key={phone.id}>{phone.performance.chipset}<small>{(phone.performance.antutu / 1_000_000).toFixed(2)} M AnTuTu</small></td>)}</tr>
              <tr><th>RAM</th>{phones.map((phone) => <td key={phone.id}>{phone.performance.ramGB} Go</td>)}</tr>
              <tr><th>Capacité</th>{phones.map((phone) => <td key={phone.id}>{phone.battery.capacityMah.toLocaleString("fr-FR")} mAh<small>{phone.battery.wiredW} W</small></td>)}</tr>
              <tr><th>Caméra</th>{phones.map((phone) => <td key={phone.id}>{phone.camera.mainMP} Mpx · {phone.camera.teleZoom || 0}×<small>{phone.camera.ois ? <><Check /> OIS</> : <><X /> Sans OIS</>}</small></td>)}</tr>
              <tr><th>Écran</th>{phones.map((phone) => <td key={phone.id}>{phone.screen.diagonal}″ · {phone.screen.refreshHz} Hz<small>{phone.screen.brightnessNits} nits</small></td>)}</tr>
              <tr><th>Résistance</th>{phones.map((phone) => <td key={phone.id}>{phone.durability.ip}<small>{phone.durability.dropMeters ? `Chute ${phone.durability.dropMeters} m` : "Distance de chute non documentée"}</small></td>)}</tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CRITERIA, criterionKeys, formatScore } from "@/lib/config";
import { cameraPhotoScore, ppi } from "@/lib/scoring";
import type { RankedPhone } from "@/lib/types";

const yesNo = (value: boolean) => value ? <><Check /> Oui</> : <><X /> Non</>;

export function ComparisonDialog({ phones, open, onOpenChange }: { phones: RankedPhone[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="comparison-dialog">
        <DialogHeader><DialogDescription>Comparaison limitée aux modèles sélectionnés</DialogDescription><DialogTitle>Comparer {phones.length} smartphones</DialogTitle></DialogHeader>
        <div className="comparison-scroll"><table className="comparison-table">
          <thead><tr><th>Critère</th>{phones.map((phone) => <th key={phone.id}><span>#{phone.rank} · confiance {phone.confidence}%</span>{phone.name}</th>)}</tr></thead>
          <tbody>
            <tr className="total-row"><th>Score final</th>{phones.map((phone) => <td key={phone.id}><strong>{formatScore(phone.total)}</strong>/100</td>)}</tr>
            {criterionKeys.map((key) => <tr key={key}><th><i style={{ background: CRITERIA[key].color }} />{CRITERIA[key].label}</th>{phones.map((phone) => <td key={phone.id}>{formatScore(phone.categoryScores[key])}</td>)}</tr>)}
            <tr><th>Système / format</th>{phones.map((phone) => <td key={phone.id}>{phone.osName}<small>{phone.formFactor}</small></td>)}</tr>
            <tr><th>Processeur</th>{phones.map((phone) => <td key={phone.id}>{phone.performance.chipset}<small>{phone.performance.sustainedPercent ?? "—"}% soutenu</small></td>)}</tr>
            <tr><th>RAM / stockage</th>{phones.map((phone) => <td key={phone.id}>{phone.performance.ramGB} Go<small>{phone.performance.storage.capacityGB} Go · {phone.performance.storage.type}</small></td>)}</tr>
            <tr><th>Autonomie</th>{phones.map((phone) => <td key={phone.id}>{phone.battery.activeUseHours ?? "—"} h actives<small>{phone.battery.capacityMah.toLocaleString("fr-FR")} mAh · {phone.battery.autonomyBasis}</small></td>)}</tr>
            <tr><th>Recharge</th>{phones.map((phone) => <td key={phone.id}>{phone.battery.chargeMinutes ?? "—"} min<small>{phone.battery.wiredW} W · sans-fil {phone.battery.wirelessW} W</small></td>)}</tr>
            <tr><th>Caméra</th>{phones.map((phone) => <td key={phone.id}>Photo {formatScore(cameraPhotoScore(phone))}<small>Vidéo {formatScore(phone.camera.videoIndex)} · selfie {formatScore(phone.camera.selfieIndex)}</small></td>)}</tr>
            <tr><th>Écran</th>{phones.map((phone) => <td key={phone.id}>{phone.screen.diagonal}″ · {Math.round(ppi(phone))} ppp<small>{phone.screen.refreshHz} Hz · {phone.screen.brightnessNits} nits</small></td>)}</tr>
            <tr><th>Résistance</th>{phones.map((phone) => <td key={phone.id}>{phone.durability.ip}<small>Réparabilité {phone.durability.repairabilityScore ?? "—"}/100</small></td>)}</tr>
            <tr><th>eSIM</th>{phones.map((phone) => <td key={phone.id}><small>{yesNo(phone.connectivity.esim)}</small></td>)}</tr>
            <tr><th>Double SIM</th>{phones.map((phone) => <td key={phone.id}><small>{yesNo(phone.connectivity.dualSim)}</small></td>)}</tr>
          </tbody>
        </table></div>
      </DialogContent>
    </Dialog>
  );
}

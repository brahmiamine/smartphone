import type { CSSProperties } from "react";
import { Info, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CRITERIA, criterionKeys, formatScore, PRESETS, updateWeightKeepingTotal } from "@/lib/config";
import type { Weights } from "@/lib/types";

export function WeightPanel({ weights, onChange, onReset }: { weights: Weights; onChange: (weights: Weights) => void; onReset: () => void }) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return (
    <aside className="weight-panel">
      <div className="panel-heading"><div><SlidersHorizontal /><span>Vos priorités</span></div><span className="total-pill">{total} %</span></div>
      <p className="panel-copy">Déplacez un curseur : les autres poids s’ajustent automatiquement et le classement se recalcule.</p>
      <div className="weights-list">
        {criterionKeys.map((key) => {
          const meta = CRITERIA[key];
          const Icon = meta.icon;
          return (
            <div className="weight-control" key={key} style={{ "--criterion": meta.color } as CSSProperties}>
              <div className="weight-label"><span><Icon />{meta.label}</span><strong>{formatScore(weights[key])}%</strong></div>
              <Slider value={[weights[key]]} min={0} max={100} step={1} aria-label={`Poids ${meta.label}`} onValueChange={(value) => onChange(updateWeightKeepingTotal(weights, key, value[0]))} />
            </div>
          );
        })}
      </div>
      <div className="preset-block"><span>Profils rapides</span><div className="preset-grid">{PRESETS.map((preset) => <button key={preset.label} onClick={() => onChange(preset.weights)}>{preset.label}</button>)}</div></div>
      <div className="formula-note"><Info /><p><strong>Calcul transparent</strong>Chaque indice vient des barèmes JSON, puis vos huit priorités sont appliquées au score final.</p></div>
      <Button variant="ghost" className="reset-button" onClick={onReset}><RotateCcw /> Réinitialiser</Button>
    </aside>
  );
}

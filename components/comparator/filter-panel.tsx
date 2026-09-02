import { Filter, RotateCcw, Signal, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DEFAULT_FILTERS } from "@/lib/config";
import type { PhoneFilters } from "@/lib/types";

type Props = { filters: PhoneFilters; onChange: (filters: PhoneFilters) => void; resultCount: number };

export function FilterPanel({ filters, onChange, resultCount }: Props) {
  const set = <Key extends keyof PhoneFilters>(key: Key, value: PhoneFilters[Key]) => onChange({ ...filters, [key]: value });
  const active = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  return (
    <section className="filter-panel" aria-label="Filtres obligatoires">
      <div className="filter-heading"><div><Filter /><strong>Filtres essentiels</strong></div><span>{resultCount} modèles</span></div>
      <div className="filter-grid">
        <label><Smartphone />Système<select value={filters.os} onChange={(event) => set("os", event.target.value as PhoneFilters["os"])}><option>Tous</option><option>Android</option><option>iOS</option></select></label>
        <label><Smartphone />Format<select value={filters.formFactor} onChange={(event) => set("formFactor", event.target.value as PhoneFilters["formFactor"])}><option>Tous</option><option>Classique</option><option>Pliable</option></select></label>
        <label><Signal />Réseau minimum<select value={filters.network} onChange={(event) => set("network", event.target.value as PhoneFilters["network"])}><option>Toutes</option><option>4G</option><option>5G</option></select></label>
      </div>
      <div className="filter-checks">
        <label><Checkbox checked={filters.esimOnly} onCheckedChange={(checked) => set("esimOnly", checked === true)} /> eSIM obligatoire</label>
        <label><Checkbox checked={filters.dualSimOnly} onCheckedChange={(checked) => set("dualSimOnly", checked === true)} /> Double SIM obligatoire</label>
      </div>
      {active && <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)}><RotateCcw /> Effacer les filtres</Button>}
    </section>
  );
}

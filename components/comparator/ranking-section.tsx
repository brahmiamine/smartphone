import { ChevronLeft, ChevronRight, GitCompareArrows, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CRITERIA, criterionKeys, formatScore } from "@/lib/config";
import type { RankedPhone } from "@/lib/types";
import { ScoreChip } from "./score-chip";

type Props = {
  phones: RankedPhone[];
  query: string;
  onQueryChange: (value: string) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
  onCompare: () => void;
  onDetail: (phone: RankedPhone) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

function dominantCriterion(phone: RankedPhone) {
  return criterionKeys.reduce((best, key) => phone.categoryScores[key] > phone.categoryScores[best] ? key : best, criterionKeys[0]);
}

export function RankingSection({ phones, query, onQueryChange, selectedIds, onToggle, onClear, onCompare, onDetail, page, pageCount, pageSize, total, onPageChange }: Props) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  return (
    <section className="ranking-section">
      <div className="ranking-toolbar"><div><h2>Classement complet</h2><span>{start}–{end} sur {total} modèles · {pageSize} par page</span></div><div className="search-box"><Search /><Input aria-label="Rechercher un téléphone" placeholder="Rechercher un modèle…" value={query} onChange={(event) => onQueryChange(event.target.value)} /></div></div>
      {selectedIds.size > 0 && <div className="selection-toolbar"><span><GitCompareArrows /> {selectedIds.size} modèle{selectedIds.size > 1 ? "s" : ""} sélectionné{selectedIds.size > 1 ? "s" : ""}</span><div><Button variant="ghost" size="sm" onClick={onClear}><X /> Effacer</Button><Button size="sm" onClick={onCompare} disabled={selectedIds.size < 2}>Comparer uniquement ces modèles</Button></div></div>}
      <div className="ranking-labels"><span>Sélection</span><span>Modèle</span><span>Indices : code couleur + annotation</span><span>Score</span></div>
      <div className="ranking-list">
        {phones.map((phone) => {
          const dominant = dominantCriterion(phone);
          const dominantMeta = CRITERIA[dominant];
          return (
            <article className={`ranking-row ${selectedIds.has(phone.id) ? "is-selected" : ""}`} key={phone.id}>
              <div className="row-select"><Checkbox checked={selectedIds.has(phone.id)} onCheckedChange={() => onToggle(phone.id)} aria-label={`Sélectionner ${phone.name}`} /></div>
              <div className={`row-rank ${phone.rank <= 3 ? "is-top" : ""}`}>{phone.rank}</div>
              <div className="phone-identity"><strong>{phone.name}</strong><span>{dominantMeta.label} · {formatScore(phone.categoryScores[dominant])}/100</span></div>
              <div className="score-chips">{criterionKeys.map((key) => <ScoreChip criterion={key} value={phone.categoryScores[key]} key={key} />)}</div>
              <div className="row-score" title={`Confiance des données : ${phone.confidence}%`}><strong>{phone.total.toFixed(1)}</strong><span>/100</span><small>{phone.confidence}% fiable{phone.closeToPrevious ? " · écart faible" : ""}</small></div>
              <Button variant="ghost" size="icon" className="row-detail" aria-label={`Voir ${phone.name}`} onClick={() => onDetail(phone)}><ChevronRight /></Button>
            </article>
          );
        })}
        {!phones.length && <div className="empty-state"><Search /><strong>Aucun modèle trouvé</strong><span>Essayez un autre nom.</span></div>}
      </div>
      {pageCount > 1 && <nav className="pagination" aria-label="Pagination du classement"><Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}><ChevronLeft /> Précédent</Button><div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => <button className={value === page ? "active" : ""} key={value} onClick={() => onPageChange(value)} aria-current={value === page ? "page" : undefined}>{value}</button>)}</div><Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === pageCount}>Suivant <ChevronRight /></Button></nav>}
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Gauge } from "lucide-react";
import { BenchmarkSection } from "@/components/comparator/benchmark-section";
import { ComparisonDialog } from "@/components/comparator/comparison-dialog";
import { PhoneCard } from "@/components/comparator/phone-card";
import { PhoneDetailDialog } from "@/components/comparator/phone-detail-dialog";
import { RankingSection } from "@/components/comparator/ranking-section";
import { WeightPanel } from "@/components/comparator/weight-panel";
import { InstallPWA } from "@/app/install-pwa";
import { PHONES } from "@/lib/catalog";
import { DEFAULT_WEIGHTS, criterionKeys } from "@/lib/config";
import { rankPhones } from "@/lib/scoring";
import type { RankedPhone, Weights } from "@/lib/types";

const PAGE_SIZE = 20;

function isValidWeights(value: unknown): value is Weights {
  if (!value || typeof value !== "object") return false;
  return criterionKeys.every((key) => Number.isFinite((value as Record<string, unknown>)[key]));
}

export default function Home() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("smartphone-score:weights");
      const parsed: unknown = saved ? JSON.parse(saved) : null;
      if (isValidWeights(parsed)) setWeights(parsed);
    } catch { /* Les préférences invalides sont ignorées. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("smartphone-score:weights", JSON.stringify(weights));
  }, [weights, hydrated]);

  const ranked = useMemo(() => rankPhones(PHONES, weights), [weights]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? ranked.filter((phone) => `${phone.name} ${phone.brand} ${phone.performance.chipset}`.toLowerCase().includes(normalized)) : ranked;
  }, [ranked, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visiblePhones = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const detailPhone = ranked.find((phone) => phone.id === detailId) ?? null;
  const comparedPhones = ranked.filter((phone) => selectedIds.has(phone.id));

  const changeQuery = (value: string) => { setQuery(value); setPage(1); };
  const changePage = (nextPage: number) => { setPage(Math.min(pageCount, Math.max(1, nextPage))); document.querySelector(".ranking-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const toggleSelection = (id: string) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const openDetail = (phone: RankedPhone) => setDetailId(phone.id);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark"><Gauge /></div><div><strong>Smartphone Score</strong><span>Comparateur multicritère</span></div></div>
        <div className="topbar-actions"><InstallPWA /></div>
      </header>

      <section className="workspace">
        <WeightPanel weights={weights} onChange={setWeights} onReset={() => setWeights(DEFAULT_WEIGHTS)} />
        <div className="results-panel">
          <div className="results-heading"><div><span className="eyebrow"><Activity /> Classement en direct</span><h1>Votre meilleur smartphone, selon vos règles.</h1></div><div className="catalog-count"><strong>{PHONES.length}</strong><span>modèles analysés</span></div></div>
          <div className="podium-grid">{ranked.slice(0, 3).map((phone, index) => <PhoneCard phone={phone} position={index + 1} onDetail={() => openDetail(phone)} key={phone.id} />)}</div>
          <RankingSection
            phones={visiblePhones}
            query={query}
            onQueryChange={changeQuery}
            selectedIds={selectedIds}
            onToggle={toggleSelection}
            onClear={() => setSelectedIds(new Set())}
            onCompare={() => setCompareOpen(true)}
            onDetail={openDetail}
            page={page}
            pageCount={pageCount}
            total={filtered.length}
            onPageChange={changePage}
          />
          <BenchmarkSection />
        </div>
      </section>

      <PhoneDetailDialog phone={detailPhone} onClose={() => setDetailId(null)} />
      <ComparisonDialog phones={comparedPhones} open={compareOpen && comparedPhones.length >= 2} onOpenChange={setCompareOpen} />
    </main>
  );
}

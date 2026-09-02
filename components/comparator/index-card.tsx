import type { ReactNode } from "react";
import { formatScore } from "@/lib/config";

export type IndexItem = { label: string; score: number; detail: string };

export function IndexCard({ title, icon, items }: { title: string; icon: ReactNode; items: IndexItem[] }) {
  return (
    <article className="index-card">
      <div className="index-card-title">{icon}<h3>{title}</h3><span>{items.length}</span></div>
      <div className="index-list">
        {items.map((item) => (
          <div className="index-row" key={`${item.label}-${item.detail}`}>
            <div><strong>{item.label}</strong><small>{item.detail}</small></div>
            <div className="index-meter"><span style={{ width: `${item.score}%` }} /></div>
            <b>{formatScore(item.score)}</b>
          </div>
        ))}
      </div>
    </article>
  );
}

import type { CSSProperties } from "react";
import { CRITERIA, formatScore } from "@/lib/config";
import type { CriterionKey } from "@/lib/types";

export function ScoreChip({ criterion, value }: { criterion: CriterionKey; value: number }) {
  const meta = CRITERIA[criterion];
  return (
    <span className="score-chip" title={`${meta.label} : ${formatScore(value)}/100`} aria-label={`${meta.label} ${formatScore(value)} sur 100`} style={{ "--chip": meta.color } as CSSProperties}>
      <small>{meta.shortLabel}</small><strong>{formatScore(value)}</strong>
    </span>
  );
}

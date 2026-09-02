import type { CSSProperties } from "react";
import { formatScore } from "@/lib/config";

export function ScoreRing({ value, rank }: { value: number; rank?: number }) {
  return (
    <div className="score-ring" style={{ "--score": `${value * 3.6}deg` } as CSSProperties}>
      <div><strong>{formatScore(value)}</strong><span>{rank ? `#${rank}` : "/ 100"}</span></div>
    </div>
  );
}

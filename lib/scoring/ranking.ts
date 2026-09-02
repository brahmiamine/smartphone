import type { CategoryScores, Phone, RankedPhone, Weights } from "@/lib/types";
import { criterionKeys, updateWeightKeepingTotal } from "@/lib/config";
import { clamp } from "./interpolation";
import { autonomyScore, cameraScore, chargingScore, durabilityScore, multitaskingScore, performanceScore, screenScore, storageScore } from "./category-scores";

export function scorePhone(phone: Phone, weights: Weights) {
  const categoryScores: CategoryScores = {
    performance: performanceScore(phone), multitasking: multitaskingScore(phone), autonomy: autonomyScore(phone), charging: chargingScore(phone),
    camera: cameraScore(phone), screen: screenScore(phone), durability: durabilityScore(phone), storage: storageScore(phone),
  };
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const total = Object.entries(categoryScores).reduce((sum, [key, value]) => sum + value * weights[key as keyof Weights], 0) / totalWeight;
  return { total: clamp(total), categoryScores, confidence: clamp(phone.dataQuality.confidence) };
}

export function rankPhones(phones: Phone[], weights: Weights): RankedPhone[] {
  const sorted = phones.map((phone) => ({ ...phone, ...scorePhone(phone, weights) })).sort((a, b) =>
    b.total - a.total || b.confidence - a.confidence || (b.battery.activeUseHours ?? 0) - (a.battery.activeUseHours ?? 0));
  const scenarios = [weights, ...criterionKeys.flatMap((key) => [
    updateWeightKeepingTotal(weights, key, Math.min(100, weights[key] + 5)),
    updateWeightKeepingTotal(weights, key, Math.max(0, weights[key] - 5)),
  ])];
  const topThreeCounts = new Map<string, number>();
  for (const scenario of scenarios) {
    phones.map((phone) => ({ id: phone.id, total: scorePhone(phone, scenario).total }))
      .sort((a, b) => b.total - a.total).slice(0, 3)
      .forEach((phone) => topThreeCounts.set(phone.id, (topThreeCounts.get(phone.id) ?? 0) + 1));
  }
  return sorted.map((phone, index) => ({
    ...phone,
    rank: index + 1,
    stability: Math.round(((topThreeCounts.get(phone.id) ?? 0) / scenarios.length) * 100),
    closeToPrevious: index > 0 && sorted[index - 1].total - phone.total < 1,
  }));
}

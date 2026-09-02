import assert from "node:assert/strict";
import test from "node:test";
import scales from "@/data/scales.json";
import { PHONES } from "@/lib/catalog";
import { DEFAULT_FILTERS, DEFAULT_WEIGHTS, criterionKeys, updateWeightKeepingTotal } from "@/lib/config";
import { filterPhones } from "@/lib/filters";
import { interpolate, rankPhones, scorePhone, validateScale } from "@/lib/scoring";
import type { CriterionKey, Points, Weights } from "@/lib/scoring";

const only = (key: CriterionKey): Weights => criterionKeys.reduce((weights, criterion) => ({ ...weights, [criterion]: criterion === key ? 100 : 0 }), {} as Weights);

test("les pondérations restent exactement à 100 %", () => {
  for (const key of criterionKeys) {
    for (let value = 0; value <= 100; value += 1) {
      const weights = updateWeightKeepingTotal(DEFAULT_WEIGHTS, key, value);
      assert.equal(Object.values(weights).reduce((sum, weight) => sum + weight, 0), 100);
      assert.ok(Object.values(weights).every((weight) => Number.isInteger(weight) && weight >= 0));
    }
  }
});

test("l'autonomie à 100 % privilégie la durée active", () => {
  const ranking = rankPhones(PHONES, only("autonomy"));
  const maximum = Math.max(...PHONES.map((phone) => phone.battery.activeUseHours ?? 0));
  assert.equal(ranking[0].battery.activeUseHours, maximum);
});

test("une donnée inconnue ne reçoit aucun plancher artificiel", () => {
  assert.equal(interpolate(null, [[1, 40], [2, 80]]), null);
  assert.throws(() => validateScale([]), /au moins deux repères/);
  assert.throws(() => validateScale([[2, 50], [1, 70]]), /croissant/);
});

test("les barèmes numériques sont monotones", () => {
  const numericScales = [
    scales.performance.androidBenchmark, scales.performance.iosBenchmark, scales.performance.sustainedPercent,
    scales.ram.android, scales.ram.ios, scales.autonomy.activeUseHours, scales.autonomy.capacityMah,
    scales.autonomy.cyclesTo80, scales.charging.wiredW, scales.charging.wirelessW,
    scales.screen.ppi, scales.screen.refreshRate, scales.screen.brightness, scales.storage.capacityGB,
  ];
  for (const scale of numericScales) {
    validateScale(scale as Points);
    for (let index = 1; index < scale.length; index += 1) assert.ok(scale[index][1] >= scale[index - 1][1]);
  }
});

test("les filtres essentiels se combinent", () => {
  const ios = filterPhones(PHONES, { ...DEFAULT_FILTERS, os: "iOS", esimOnly: true });
  assert.ok(ios.length > 0);
  assert.ok(ios.every((phone) => phone.os === "iOS" && phone.connectivity.esim));
  const foldables = filterPhones(PHONES, { ...DEFAULT_FILTERS, formFactor: "Pliable" });
  assert.ok(foldables.length > 0);
  assert.ok(foldables.every((phone) => phone.formFactor === "Pliable"));
});

test("le catalogue 2024–2026 est unique, sourcé et calculable", () => {
  assert.ok(PHONES.length >= 60);
  assert.equal(new Set(PHONES.map((phone) => phone.id)).size, PHONES.length);
  assert.deepEqual([...new Set(PHONES.map((phone) => phone.releaseYear))].sort(), [2024, 2025, 2026]);
  for (const phone of PHONES) {
    assert.ok(phone.sources.length > 0, `${phone.name} doit avoir une source`);
    assert.ok(phone.dataQuality.confidence >= 0 && phone.dataQuality.confidence <= 100);
    const result = scorePhone(phone, DEFAULT_WEIGHTS);
    assert.ok(Number.isFinite(result.total), `${phone.name} doit avoir un score fini`);
    assert.ok(Object.values(result.categoryScores).every((score) => score >= 0 && score <= 100));
  }
});

test("chaque critère à 100 % classe selon son propre indice", () => {
  for (const key of criterionKeys) {
    const ranking = rankPhones(PHONES, only(key));
    for (let index = 1; index < ranking.length; index += 1) assert.ok(ranking[index - 1].categoryScores[key] >= ranking[index].categoryScores[key]);
  }
});

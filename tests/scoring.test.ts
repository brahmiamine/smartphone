import assert from "node:assert/strict";
import test from "node:test";
import { PHONES } from "@/lib/catalog";
import { capacityScore, rankPhones, scorePhone } from "@/lib/scoring";
import type { Weights } from "@/lib/types";

test("la plus grande batterie gagne lorsque Batterie vaut 100 %", () => {
  const weights: Weights = { cpu: 0, ram: 0, battery: 100, camera: 0, screen: 0, durability: 0 };
  const ranking = rankPhones(PHONES, weights);
  const largestCapacity = Math.max(...PHONES.map((phone) => phone.battery.capacityMah));
  assert.equal(ranking[0].battery.capacityMah, largestCapacity);
  assert.equal(ranking[0].name, "HONOR X80 Pro Max");
});

test("les repères batterie demandés restent stables", () => {
  assert.equal(capacityScore(7000), 80);
  assert.equal(capacityScore(8000), 80);
  assert.equal(capacityScore(10000), 95);
  assert.equal(capacityScore(11000), 100);
});

test("les 15 modèles recherchés sont présents et calculables", () => {
  const expectedIds = [
    "huawei-pura-80-ultra", "vivo-x300-pro", "oppo-find-x9-ultra", "vivo-x300-ultra",
    "google-pixel-11-pro-xl", "oppo-find-x8-ultra", "apple-iphone-17-pro", "vivo-x200-ultra",
    "xiaomi-17-ultra", "motorola-razr-fold", "motorola-signature", "google-pixel-10-pro-xl",
    "huawei-pura-70-ultra", "apple-iphone-16-pro-max", "google-pixel-9-pro-xl",
  ];
  const ids = new Set(PHONES.map((phone) => phone.id));
  assert.equal(PHONES.length, 38);
  assert.equal(ids.size, PHONES.length);

  for (const id of expectedIds) {
    const phone = PHONES.find((item) => item.id === id);
    assert.ok(phone, `${id} doit être présent`);
    assert.ok(phone.sourceUrl, `${id} doit avoir une fiche constructeur`);
    assert.ok(phone.cameraLabUrl, `${id} doit avoir un test caméra`);
    const result = scorePhone(phone, { cpu: 20, ram: 10, battery: 25, camera: 25, screen: 10, durability: 10 });
    assert.ok(Number.isFinite(result.total), `${id} doit avoir un score fini`);
    assert.ok(Object.values(result.categoryScores).every(Number.isFinite), `${id} doit avoir six indices finis`);
  }
});

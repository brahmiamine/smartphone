import assert from "node:assert/strict";
import test from "node:test";
import { PHONES } from "@/lib/catalog";
import { capacityScore, rankPhones } from "@/lib/scoring";
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

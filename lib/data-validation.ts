import type { CriterionKey, Phone, Weights } from "@/lib/types";

const finite = (value: unknown, label: string, minimum = 0) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) throw new Error(`${label} est invalide`);
};

export function validateWeights(weights: Weights, keys: CriterionKey[]) {
  keys.forEach((key) => finite(weights[key], `Poids ${key}`));
  const total = keys.reduce((sum, key) => sum + weights[key], 0);
  if (total !== 100) throw new Error(`La somme des poids doit être 100, reçu ${total}`);
}

export function validateCatalog(value: unknown): Phone[] {
  if (!Array.isArray(value) || !value.length) throw new Error("Le catalogue doit contenir au moins un smartphone");
  const ids = new Set<string>();
  for (const raw of value) {
    const phone = raw as Phone;
    if (!phone.id || !phone.name || !phone.brand) throw new Error("Un smartphone n'a pas d'identité complète");
    if (ids.has(phone.id)) throw new Error(`Identifiant dupliqué : ${phone.id}`);
    ids.add(phone.id);
    if (![2024, 2025, 2026].includes(phone.releaseYear)) throw new Error(`${phone.name} : année hors périmètre`);
    if (!(["Android", "iOS"] as string[]).includes(phone.os)) throw new Error(`${phone.name} : système invalide`);
    if (!(["Classique", "Pliable"] as string[]).includes(phone.formFactor)) throw new Error(`${phone.name} : format invalide`);
    finite(phone.dataQuality?.confidence, `${phone.name} : confiance`);
    if (phone.dataQuality.confidence > 100) throw new Error(`${phone.name} : confiance supérieure à 100`);
    finite(phone.performance?.ramGB, `${phone.name} : RAM`, 1);
    finite(phone.performance?.storage?.capacityGB, `${phone.name} : stockage`, 1);
    finite(phone.battery?.capacityMah, `${phone.name} : batterie`, 1);
    finite(phone.battery?.wiredW, `${phone.name} : recharge`);
    finite(phone.screen?.diagonal, `${phone.name} : diagonale`, 1);
    finite(phone.screen?.widthPx, `${phone.name} : largeur écran`, 1);
    finite(phone.screen?.heightPx, `${phone.name} : hauteur écran`, 1);
    for (const [label, score] of Object.entries({ photo: phone.camera?.photoIndex, vidéo: phone.camera?.videoIndex, selfie: phone.camera?.selfieIndex })) {
      finite(score, `${phone.name} : score ${label}`);
      if ((score as number) > 100) throw new Error(`${phone.name} : score ${label} supérieur à 100`);
    }
    if (!Array.isArray(phone.sources) || !phone.sources.length) throw new Error(`${phone.name} : source manquante`);
    if (phone.sources.some((source) => !source.url.startsWith("https://"))) throw new Error(`${phone.name} : URL source invalide`);
  }
  return value as Phone[];
}

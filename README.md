# Smartphone Score

Comparateur multicritère de smartphones, responsive et installable comme une application PWA.

## Fonctionnalités

- classement dynamique selon huit priorités ajustables ;
- performances réelles, multitâche/RAM, autonomie, recharge, caméra, écran, résistance/réparabilité et stockage ;
- filtres Android/iOS, classique/pliable, eSIM, 4G/5G et double SIM ;
- comparaison ciblée de plusieurs modèles et pagination du catalogue ;
- sauvegarde locale des préférences ;
- installation sur ordinateur, Android, iPhone et iPad ;
- déploiement automatique sur GitHub Pages.

## Organisation du projet

- `data/smartphones.json` : catalogue et caractéristiques des modèles ;
- `data/scales.json` : tous les seuils et barèmes de notation ;
- `lib/scoring/` : interpolation validée, sous-scores et classement ;
- `lib/data-validation.ts` : validation du catalogue et des pondérations ;
- `components/comparator/` : composants réutilisables de comparaison, classement, barèmes et pondération.

Le catalogue couvre 61 modèles sortis entre 2024 et 2026. Chaque fiche contient ses sources, sa date de vérification et les valeurs estimées lorsque les mesures comparables ne sont pas publiées. L'indice de confiance reste informatif : il ne modifie pas artificiellement le score final.

La caméra regroupe trois sous-scores : photo 55 %, vidéo 30 % et selfie 15 %. L'autonomie privilégie les heures d'usage actif (70 %), devant la capacité (20 %) et la longévité en cycles (10 %). Les données absentes utilisent `null` et ne reçoivent aucun score plancher.

## Développement

```bash
npm ci
npm run dev
npm run lint
npm test
npm run build
```

Chaque push sur `main` construit et publie automatiquement le site.

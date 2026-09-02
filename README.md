# Smartphone Score

Comparateur multicritère de smartphones, responsive et installable comme une application PWA.

## Fonctionnalités

- classement dynamique selon six priorités ajustables ;
- indices transparents pour CPU, RAM, batterie, caméra, écran et résistance ;
- comparaison ciblée de plusieurs modèles et pagination du catalogue ;
- sauvegarde locale des préférences ;
- installation sur ordinateur, Android, iPhone et iPad ;
- déploiement automatique sur GitHub Pages.

## Organisation du projet

- `data/smartphones.json` : catalogue et caractéristiques des modèles ;
- `data/scales.json` : tous les seuils et barèmes de notation ;
- `lib/scoring.ts` : moteur de calcul pur et classement ;
- `components/comparator/` : composants réutilisables de comparaison, classement, barèmes et pondération.

Chaque fiche peut référencer une source constructeur (`sourceUrl`), un test caméra DXOMARK (`cameraLabUrl`) et les valeurs estimées (`estimatedFields`) lorsque le fabricant ne publie pas une donnée nécessaire au calcul.

## Développement

```bash
npm ci
npm run dev
```

Chaque push sur `main` construit et publie automatiquement le site.

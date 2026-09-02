# Smartphone Score

Comparateur multicritère de smartphones, responsive et installable comme une application PWA.

## Fonctionnalités

- classement dynamique selon six priorités ajustables ;
- indices transparents pour CPU, RAM, batterie, caméra, écran et résistance ;
- ajout et modification de téléphones ;
- sauvegarde locale des préférences ;
- installation sur ordinateur, Android, iPhone et iPad ;
- déploiement automatique sur GitHub Pages.

## Organisation du projet

- `data/smartphones.json` : catalogue et caractéristiques des modèles ;
- `data/scales.json` : tous les seuils et barèmes de notation ;
- `lib/scoring.ts` : moteur de calcul pur et classement ;
- `components/comparator/` : composants réutilisables de comparaison, classement, barèmes et pondération.

## Développement

```bash
npm ci
npm run dev
```

Chaque push sur `main` construit et publie automatiquement le site.

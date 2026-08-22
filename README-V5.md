# Mes Propriétés V5 Android

Version Android installable construite automatiquement par GitHub Actions.

## Fonctions incluses
- Plusieurs sociétés/comptes propriétaires avec changement de compte
- Biens séparés par société
- Forêt, pré, habitation, immeuble et terrain
- Carte cadastrale IGN / Parcellaire Express
- Recherche par code INSEE, section et numéro de parcelle
- Ajout d'une parcelle cadastrale au patrimoine avec sa géométrie
- Surface, valeur, nombre de lots/logements, notes et travaux
- Plusieurs locataires/lots par bien
- Loyer, charges, dates de bail, téléphone, e-mail et notes
- Échéances de biens et de baux dans le tableau de bord
- Photo du bien stockée localement
- Sauvegarde/restauration JSON
- APK Android généré automatiquement comme artefact GitHub Actions

## APK
Le workflow `.github/workflows/build-v5-apk.yml` compile un APK Android debug installable et publie l'artefact `Mes-Proprietes-V5-APK`.

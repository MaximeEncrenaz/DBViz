# Historique des évolutions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

### Ajouté
- Squelette de l'application autonome `src/index.html`, utilisable hors ligne (politique de sécurité du contenu : aucune requête réseau).
- Lecture et écriture du DBML sans bibliothèque : projet, tables, colonnes, index, références (en ligne, en bloc, composites), énumérations, groupes de tables et notes. Erreurs signalées avec leur numéro de ligne, références pendantes écartées et listées.
- Mode édition protégé par un cadenas (lecture seule par défaut), basculé aussi par la touche E et retenu par le navigateur. Import et rechargement de l'exemple réservés au mode édition ; export DBML toujours disponible.
- Exemple « boutique » (`exemples/boutique.dbml`), chargé au premier lancement.

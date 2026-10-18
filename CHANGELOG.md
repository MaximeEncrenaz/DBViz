# Historique des évolutions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

### Ajouté
- Vue graphe : plan d'ensemble par groupe de tables, focus sur une table (lecture de gauche à droite, clés étrangères à gauche, tables référencées à droite), focus sur un groupe, constellations par groupe pour un schéma. Cartes en trois niveaux de détail, traits colorés par cardinalité, références réflexives en boucle, filtres, légende, recherche, zoom et transitions animées.
- Édition des tables (colonnes comprises), des références et des groupes, depuis le panneau de détail ou par gestes dans le graphe ; renommages répercutés sur les références ; annulation (Ctrl+Z) des 20 dernières modifications.
- Onglet DBML : source du modèle à copier, modifiable et applicable en mode édition.
- Interface d'outil de développeur : identifiants en chasse fixe, contrôles segmentés, barre d'état (compteurs, zoom, mode), thèmes clair et sombre.
- Squelette de l'application autonome `src/index.html`, utilisable hors ligne (politique de sécurité du contenu : aucune requête réseau).
- Lecture et écriture du DBML sans bibliothèque : projet, tables, colonnes, index, références (en ligne, en bloc, composites), énumérations, groupes de tables et notes. Erreurs signalées avec leur numéro de ligne, références pendantes écartées et listées.
- Mode édition protégé par un cadenas (lecture seule par défaut), basculé aussi par la touche E et retenu par le navigateur. Import et rechargement de l'exemple réservés au mode édition ; export DBML toujours disponible.
- Exemple « boutique » (`exemples/boutique.dbml`), chargé au premier lancement.

### Modifié
- Couleurs des groupes de l'exemple éclaircies pour rester lisibles en thème sombre.

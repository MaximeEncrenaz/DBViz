# DBViz

Visualisation d'un **modèle de base de données relationnelle** décrit en [DBML](https://dbml.dbdiagram.io/docs/) : tables, colonnes, références (clés étrangères) et groupes de tables. On importe un fichier `.dbml`, on parcourt le modèle sous forme de graphe, on le modifie et on l'exporte de nouveau en DBML.

L'application tient dans un seul fichier, `index.html`, qui fonctionne **hors ligne** : aucune installation, aucun serveur, aucune ressource externe.

## Utilisation

1. Ouvrir `index.html` dans un navigateur récent (Edge, Chrome, Firefox).
2. L'application démarre avec un exemple (boutique en ligne, [exemples/boutique.dbml](exemples/boutique.dbml)).
3. Le modèle est enregistré automatiquement dans le navigateur. Il n'est visible que sur ce poste et ce navigateur : **Exporter .dbml** le télécharge, **Importer** (en mode édition) en recharge un.

## Fonctionnalités

- **Graphe** :
  - plan d'ensemble : les tables rangées dans le cadre de leur groupe (`TableGroup`), les groupes les plus liés côte à côte ;
  - clic sur une table : lecture de gauche à droite, avec la table au centre, les tables qui portent une clé étrangère vers elle à gauche et les tables qu'elle référence à droite ;
  - choix d'un groupe : ses références, avec la table la plus reliée au centre ;
  - choix d'un schéma (si le modèle en compte plusieurs) : une constellation par groupe ;
  - cartes en trois niveaux de détail (**Toutes** les colonnes, par défaut, **Clés** : clés primaires et étrangères, **Titre** seul) ;
  - traits colorés selon la cardinalité (N:1, 1:1, N:N), en tirets pour une clé étrangère facultative ; étiquettes au choix : colonnes reliées, noms des références, aucune ;
  - filtres par cardinalité et par groupe, légende, recherche d'une table (touche **/**), zoom à la molette, transitions animées entre les vues.
- **Panneau de détail** : colonnes d'une table avec leurs propriétés, clés étrangères et tables qui la référencent, détail d'une référence ou d'un groupe ; synthèse du modèle sans sélection.
- **Onglet DBML** : le modèle en texte, à copier ; en mode édition, modifiable et appliqué par **Appliquer** (ou Ctrl+Entrée), l'erreur éventuelle étant signalée avec sa ligne.
- **Import DBML** : `Project`, `Table` (schéma, alias, couleur, notes, réglages de colonnes, index), `Ref` (autonomes, en bloc ou en ligne, composites, actions `delete` / `update`), `Enum`, `TableGroup`, `Note`. Une erreur de syntaxe est signalée avec son numéro de ligne ; les références vers une table ou une colonne inconnue sont écartées et listées dans la synthèse. Détails : [docs/format-dbml.md](docs/format-dbml.md).
- **Export DBML**, disponible même en lecture seule.
- **Mode édition** : l'application s'ouvre en lecture seule. Le bouton cadenas du bandeau, ou la touche **E**, débloque l'import et l'ajout, la modification et la suppression de tables (avec leurs colonnes), de références et de groupes. Renommer une table ou une colonne met à jour les références. **Ctrl+Z** (ou « ↶ ») annule les 20 dernières modifications. Le mode choisi est retenu par le navigateur. Dans le graphe, en mode édition :
  - double-clic sur le fond : nouvelle table, rangée dans le groupe sous le pointeur ;
  - double-clic sur une table : la modifier ;
  - glisser d'une table à une autre : nouvelle référence, préremplie avec la clé primaire visée et la colonne `<table>_id` si elle existe ;
  - Maj + glisser : déplacer une carte.
- **Thème clair ou sombre** : par défaut celui du système ; le bouton à gauche du cadenas passe de *système* à *clair* puis *sombre*. Le choix est retenu par le navigateur.

## Raccourcis

| Touche | Effet |
| --- | --- |
| **E** | Lecture seule / édition |
| **/** | Aller à une table |
| **Échap** | Désélectionner, puis revenir au plan d'ensemble |
| **Ctrl+Z** | Annuler (édition) |
| **Ctrl+Entrée** | Appliquer le DBML saisi (onglet DBML, édition) |

## Structure du dépôt

| Chemin | Rôle |
| --- | --- |
| `index.html` | L'application complète (HTML, CSS et JavaScript intégrés) |
| `exemples/` | Fichiers DBML importables |
| `docs/` | Documentation, dont le sous-ensemble DBML pris en charge |
| `scripts/` | Outils de maintenance (Node.js), sans effet sur l'application |
| `.claude/skills/` | Conventions communes à mes projets (graphe, mode édition), copiées de `../skills/` (non versionnées) |
| `CHANGELOG.md` | Historique des évolutions |
| `CLAUDE.md` | Consignes pour Claude Code (architecture, vérifications) |

## Développement

Pas de compilation, pas de dépendance : on modifie `index.html` puis on recharge la page. Le fichier doit rester autonome (pas de CDN, pas de police web).

Après modification de `exemples/boutique.dbml`, recopier l'exemple dans l'application :

```sh
node scripts/sync-exemple.js
```

Vérification de la syntaxe du script intégré (Git Bash, Node.js installé) :

```sh
sed -n '/<script>/,/<\/script>/p' index.html | sed '1d;$d' > /tmp/app.js && node --check /tmp/app.js
```

## Licence

© Maxime Encrenaz. Tous droits réservés. Aucune réutilisation sans autorisation.

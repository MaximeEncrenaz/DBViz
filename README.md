# DBViz

Visualisation d'un **modèle de base de données relationnelle** décrit en [DBML](https://dbml.dbdiagram.io/docs/) : tables, colonnes, références (clés étrangères) et groupes de tables. On importe un fichier `.dbml`, on parcourt le modèle sous forme de graphe, on le modifie et on l'exporte de nouveau en DBML.

L'application tient dans un seul fichier, `src/index.html`, qui fonctionne **hors ligne** : aucune installation, aucun serveur, aucune ressource externe.

> État : squelette. Le bandeau, le mode édition, la lecture et l'écriture du DBML sont en place ; la vue graphe et les éditeurs restent à construire.

## Utilisation

1. Ouvrir `src/index.html` dans un navigateur récent (Edge, Chrome, Firefox).
2. L'application démarre avec un exemple (boutique en ligne, [exemples/boutique.dbml](exemples/boutique.dbml)).
3. Le modèle est enregistré automatiquement dans le navigateur. Il n'est visible que sur ce poste et ce navigateur : **Exporter** le télécharge au format `.dbml`, **Importer** (en mode édition) en recharge un.

## Fonctionnalités

- **Import DBML** : `Project`, `Table` (schéma, alias, couleur, notes, réglages de colonnes, index), `Ref` (autonomes, en bloc ou en ligne, composites, actions `delete` / `update`), `Enum`, `TableGroup`, `Note`. Une erreur de syntaxe est signalée avec son numéro de ligne ; les références vers une table ou une colonne inconnue sont écartées et listées dans le panneau de détail. Détails : [docs/format-dbml.md](docs/format-dbml.md).
- **Export DBML**, disponible même en lecture seule.
- **Graphe** (à venir) : plan d'ensemble des tables rangées par groupe, focus sur une table (tables qui la référencent à gauche, tables référencées à droite), focus sur un groupe.
- **Mode édition** : l'application s'ouvre en lecture seule. Le bouton cadenas du bandeau, ou la touche **E**, débloque l'import, le renommage du modèle et, à terme, l'ajout, la modification et la suppression de tables, colonnes et références. Le mode choisi est retenu par le navigateur. Dans le graphe, en mode édition (à venir) :
  - double-clic sur le fond : nouvelle table, rangée dans le groupe sous le pointeur ;
  - glisser d'une table à une autre : nouvelle référence ;
  - Maj + glisser : déplacer une carte.

## Structure du dépôt

| Chemin | Rôle |
| --- | --- |
| `src/index.html` | L'application complète (HTML, CSS et JavaScript intégrés) |
| `exemples/` | Fichiers DBML importables |
| `docs/` | Documentation, dont le sous-ensemble DBML pris en charge |
| `scripts/` | Outils de maintenance (Node.js), sans effet sur l'application |
| `.claude/skills/` | Conventions communes à mes projets (graphe, mode édition), copiées de `../skills/` |
| `CHANGELOG.md` | Historique des évolutions |
| `CLAUDE.md` | Consignes pour Claude Code (architecture, vérifications) |

## Développement

Pas de compilation, pas de dépendance : on modifie `src/index.html` puis on recharge la page. Le fichier doit rester autonome (pas de CDN, pas de police web).

Après modification de `exemples/boutique.dbml`, recopier l'exemple dans l'application :

```sh
node scripts/sync-exemple.js
```

Vérification de la syntaxe du script intégré (Git Bash, Node.js installé) :

```sh
sed -n '/<script>/,/<\/script>/p' src/index.html | sed '1d;$d' > /tmp/app.js && node --check /tmp/app.js
```

## Licence

© Maxime Encrenaz. Tous droits réservés. Aucune réutilisation sans autorisation.

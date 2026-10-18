# Format DBML pris en charge

DBViz lit et écrit un sous-ensemble du langage [DBML](https://dbml.dbdiagram.io/docs/). Le fichier [exemples/boutique.dbml](../exemples/boutique.dbml) en montre l'essentiel.

## Éléments reconnus

| Élément | Exemple | Remarques |
| --- | --- | --- |
| Projet | `Project boutique { database_type: 'PostgreSQL' Note: '…' }` | Le nom du projet est le nom du modèle affiché dans le bandeau. |
| Table | `Table ventes.commandes as C [headercolor: #0f6c7a, note: '…'] { … }` | Schéma, alias et couleur facultatifs. Sans schéma, la table est dans `public`. |
| Colonne | `email varchar(255) [unique, not null, default: '', note: '…']` | Réglages : `pk` / `primary key`, `increment`, `not null` / `null`, `unique`, `default`, `note`, `ref`. |
| Valeur par défaut | `'FR'`, `` `now()` ``, `0`, `false`, `null` | Texte, expression entre accents graves, ou valeur brute. |
| Index | `indexes { (a, b) [unique] }` | Conservés tels quels à l'export ; pas encore affichés. |
| Note de table | `Note: '…'` ou `Note { '…' }` dans la table | |
| Référence | `Ref nom: a.b > c.d [delete: cascade, update: no action]` | Aussi en bloc `Ref { … }`, en ligne `[ref: > c.d]` et composite `a.(x, y) > c.(u, v)`. |
| Énumération | `Enum statut { brouillon validee [note: '…'] }` | |
| Groupe de tables | `TableGroup ventes [color: #6b2f7a] { commandes paiements }` | |
| Note autonome | `Note memo { '…' }` | |

Commentaires `//` et `/* … */`, identifiants entre guillemets (`"ligne x"`) et textes sur plusieurs lignes (`'''…'''`) sont acceptés.

## Relations

| Symbole | Sens |
| --- | --- |
| `>` | plusieurs-à-un : la colonne de gauche porte la clé étrangère |
| `<` | un-à-plusieurs : retourné à la lecture en `>` (la clé étrangère est à droite) |
| `-` | un-à-un |
| `<>` | plusieurs-à-plusieurs |

## Contrôles à l'import

- Erreur de syntaxe : l'import est refusé et le message indique la ligne.
- Référence vers une table ou une colonne inconnue, table inconnue dans un groupe, couleur qui n'est pas au format `#rgb` ou `#rrggbb` : l'élément est écarté et signalé dans le panneau « Synthèse ».

## Export

L'export produit un DBML canonique, relu à l'identique par DBViz :

- ordre : projet, énumérations, tables, groupes, références, notes ;
- les références en ligne (`[ref: …]`) deviennent des références autonomes `Ref: …`, et `<` est écrit `>` en inversant les deux côtés ;
- les commentaires du fichier importé ne sont pas conservés.

Non pris en charge pour l'instant : `TablePartial`, `checks`, réglages de projet autres que texte, couleurs des références.

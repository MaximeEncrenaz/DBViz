---
name: mode-edition
description: Convention commune à mes projets pour le mode lecture seule / mode édition d'une application ou d'une page web — entrée et sortie (cadenas dans le bandeau, touche E), mémorisation, retour visuel, et ce que le mode édition affiche, masque ou autorise. À appliquer dès qu'on crée ou modifie une interface où l'utilisateur peut ajouter, modifier ou supprimer des données, qu'on ajoute un bouton ou un geste de modification, ou qu'on revoit le bandeau d'une application.
---

# Mode édition : lecture seule par défaut, cadenas et touche E

Toutes mes applications qui permettent de modifier des données ont **deux modes** : *lecture seule* (par défaut) et *édition*. Le but est d'éviter les modifications accidentelles pendant la consultation (réunion, partage d'écran, exploitation). Ce n'est **pas** une sécurité : pas de mot de passe, pas de droits ; n'importe qui peut déverrouiller.

Le comportement doit être **identique d'un projet à l'autre**. Adapter seulement la technique (vanilla, React…), jamais les règles ci-dessous sans accord explicite.

## 1. Entrer et sortir du mode édition

- **Cadenas dans le bandeau**, à gauche des autres actions (Importer, Exporter…), séparé d'elles par un trait vertical.
  - Lecture seule : cadenas fermé + libellé « Lecture seule ». Infobulle : « Déverrouiller pour ajouter, modifier ou supprimer (E) ».
  - Édition : cadenas ouvert + libellé « Édition ». Infobulle : « Verrouiller : repasser en lecture seule (E) ».
  - Un clic bascule d'un mode à l'autre, sans confirmation.
- **Touche E** (minuscule ou majuscule) : même bascule. Elle est **ignorée** :
  - pendant une saisie (cible dans `input`, `select`, `textarea`, `[contenteditable]`) ;
  - quand une fenêtre modale / un éditeur est ouvert ;
  - avec Ctrl, Alt ou Méta (les raccourcis du navigateur restent intacts) ;
  - sur la répétition automatique (`e.repeat`).
  Appeler `preventDefault()` quand elle est prise en compte.
- **Mémorisation par navigateur** : le mode est enregistré dans `localStorage` sous `<appli>.edition` (`'1'` / `'0'`) et relu au chargement. En l'absence de valeur, ou si le stockage est indisponible : **lecture seule**.
- Pas d'autre moyen d'entrer en édition (pas de double-clic qui déverrouille, pas de paramètre d'URL).

## 2. Retour visuel

- `body.editing` est posé en mode édition : c'est le seul crochet CSS pour tout ce qui change d'aspect.
- Couleur du mode édition : l'**ambre d'avertissement** du thème (`--warn` / `--warn-soft`), jamais la couleur d'accent (réservée à la sélection et aux actions principales).
  - Cadenas ouvert : fond `--warn-soft`, bordure et texte `--warn`, texte en gras.
  - Bandeau : liseré ambre de 3 px en bas (`box-shadow: inset 0 -3px 0 var(--warn)`).
- Thème sombre : mêmes jetons, redéfinis dans le bloc sombre ; rien de spécifique au mode.

## 3. Ce que fait le mode édition sur la page

**En lecture seule**, l'interface est complète pour consulter, mais **sans aucune affordance de modification** :

- pas de boutons « + Ajouter », « Modifier », « Supprimer », pas de croix de retrait sur les pastilles, pas de cases « + … » ;
- masqués : les actions qui remplacent ou modifient les données en masse (Importer, Charger l'exemple, Réinitialiser les données…) ;
- **toujours disponibles** : navigation, sélection, filtres, simulations, recherche, **export** (lire n'est pas modifier) ;
- les titres renommables (nom du document, du dispositif…) sont affichés mais désactivés (`disabled`, pas de soulignement au survol) ;
- les gestes de création ou d'édition (double-clic pour créer, glisser pour relier, déplacer un élément…) ne font rien ou gardent leur sens de consultation (déplacer la vue) ;
- là où l'on s'attendrait à pouvoir modifier, une courte aide : « Déverrouillez le cadenas pour ajouter ou modifier… ».

**En édition**, apparaissent sur place : les boutons d'ajout et les actions par ligne / par carte, les croix de retrait, les cases et colonnes « + … », l'import, les gestes de création, et une courte aide qui rappelle les gestes disponibles. Le reste de la page ne change pas : **même vue, même sélection, même défilement**. Basculer de mode ne doit jamais réinitialiser l'état d'interface (vue, filtres, sélection) ni les données.

## 4. Règles d'implémentation

- Un seul état `ui.edit` (non persisté avec les données, seulement dans la clé `<appli>.edition`), une seule fonction pour le changer, qui enregistre puis re-rend.
- **Toute** affordance de modification passe par des aides qui ne rendent rien hors édition (`editBtn()`, `rowActions()`…) : ne jamais tester `ui.edit` au cas par cas dans le gabarit quand une aide existe.
- **Défense en profondeur** : les fonctions qui modifient ou ouvrent un éditeur (`openEditor`, `removeItem`, import…) refusent elles aussi d'agir si `!ui.edit`. Un bouton oublié ou un raccourci ne doit pas pouvoir modifier en lecture seule.
- Un éditeur déjà ouvert reste utilisable jusqu'à sa fermeture ; la touche E est sans effet tant qu'il est ouvert.
- Libellés de l'interface en français, comme ci-dessus.

### Référence (vanilla JS)

```js
const EDIT_KEY = 'monappli.edition';
function setEditMode(on) {
  ui.edit = on;
  try { localStorage.setItem(EDIT_KEY, on ? '1' : '0'); } catch (_) { /* ignoré */ }
  renderAll();
}
// Au démarrage : lecture seule par défaut.
try { ui.edit = localStorage.getItem(EDIT_KEY) === '1'; } catch (_) { /* lecture seule */ }

// Rendu du bandeau.
document.body.classList.toggle('editing', ui.edit);
lockBtn.classList.toggle('on', ui.edit);
lockBtn.title = ui.edit ? 'Verrouiller : repasser en lecture seule (E)' : 'Déverrouiller pour ajouter, modifier ou supprimer (E)';
// contenu : icône cadenas (fermé / ouvert) + (ui.edit ? 'Édition' : 'Lecture seule')

// Aide de gabarit : rien hors édition.
const editBtn = (text, onclick, primary) => (ui.edit ? h('button', { class: 'btn small' + (primary ? ' primary' : ''), onclick }, text) : null);

// Bascule au clavier.
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'e' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.repeat && !editorIsOpen()
    && !e.target.closest?.('input, select, textarea, [contenteditable]')) {
    e.preventDefault();
    setEditMode(!ui.edit);
  }
});
```

```css
.btn.lock.on { background: var(--warn-soft); border-color: var(--warn); color: var(--warn); font-weight: 600; }
body.editing header { box-shadow: inset 0 -3px 0 var(--warn), 0 1px 2px rgba(10, 20, 30, .05); }
```

Icône du cadenas (SVG en ligne, sans dépendance) : un rectangle plein pour le corps et un arc pour l'anse, fermé (`M4 7V4.5a3 3 0 0 1 6 0V7`) ou ouvert (`M4 7V4.5a3 3 0 0 1 5.8-1`), `viewBox="0 0 14 16"`.

## 5. Vérifier avant de livrer

1. Au premier chargement (stockage vide) : lecture seule, aucune affordance de modification visible nulle part, export disponible.
2. Cadenas puis touche E : bascule dans les deux sens, état conservé après rechargement.
3. E tapé dans un champ, une liste déroulante ou un éditeur ouvert : aucune bascule ; Ctrl+E : comportement du navigateur.
4. En lecture seule, appeler directement les fonctions de modification (console) : elles refusent.
5. Bascule de mode : vue, filtres, sélection et défilement inchangés.
6. Thèmes clair et sombre : cadenas ambre et liseré du bandeau lisibles.
7. Documenter le raccourci E dans le README (section mode édition) et l'infobulle du cadenas.

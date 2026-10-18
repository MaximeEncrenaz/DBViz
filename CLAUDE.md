# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DBViz visualises a **relational database model** read from a [DBML](https://dbml.dbdiagram.io/docs/) file: tables, columns, references (foreign keys) and table groups. It imports DBML, lets the user edit the model, and exports it back to DBML. The user is French: the UI, README, CHANGELOG and `docs/` are in French; code identifiers and this file are in English.

Repository layout: `src/index.html` (the app), `exemples/` (importable DBML files; `boutique.dbml` is copied into the in-app `SAMPLE` constant by `node scripts/sync-exemple.js` — re-run it whenever the file changes), `docs/format-dbml.md` (user-facing description of the supported DBML subset, in French — keep it in sync with `parseDbml()` / `toDbml()`), `README.md`, `CHANGELOG.md` (French, Keep a Changelog style). No license: all rights reserved. Line endings are LF (`.gitattributes`, `.editorconfig`). Git default branch: `main`.

## Conventions shared with the user's other projects (skills)

Two project skills live in `.claude/skills/` (git-ignored) and **must** be followed; they are copies of `../skills/` (the user's source of truth, shared with UrbaComm — re-copy them if that folder changes, don't edit the copies alone):

- **`mode-edition`** — read-only by default, padlock in the header + E key, `localStorage` key `dbviz.edition`, `body.editing` amber underline, every modification affordance gated by `editBtn()`-style helpers, and defence in depth (mutating functions refuse when `!ui.edit`). Implemented by `setEditMode()`, `editBtn()` / `iconBtn()`, `lockIcon()`, the keydown handler and `renderHeader()`.
- **`graphe-reseau`** — scenes, flow and constellation layouts, visual encoding, interactions, transitions and graph editing gestures. Reference implementation: `../UrbaComm/src/index.html` (`buildScene`, `flowLayout`, `planTargets`, `constellation`, `tweenTo`, `fitCamera`, `measure`, `boundary`). Reuse its code shape rather than reinventing it.

### Mapping graphe-reseau → DBML (agreed defaults, confirm with the user before departing from them)

| graphe-reseau | DBViz |
|---|---|
| entité | **table** — card with the table name in bold and its schema; group colour bar on the left (`TableGroup` colour, else `headercolor`) |
| groupe | **`TableGroup`**; tables in no group sit outside any frame in the plan, and form a « Sans groupe » constellation |
| lien direct | **`Ref`** between two tables; « sens » = from the table holding the foreign key (`ref.from`) to the referenced table (`ref.to`), so in focus scenes **child tables are on the left, referenced tables on the right**; `-` (one-to-one) and `<>` (many-to-many) are bidirectional |
| criticité (colour / thickness) | **cardinality** (`>` many-to-one, `-` one-to-one, `<>` many-to-many); dashed line when the FK column is nullable |
| lien multipartite (diamond) | not used for now (a future option: show junction tables of `<>` relations as diamonds) |
| focus entité | click on a table: its references in the left → right flow layout |
| focus thème | a `TableGroup` chosen (context bar): the references touching it, plus the group's unlinked tables |
| constellations par période | a schema chosen (selector shown only when the model has several schemas): one constellation per `TableGroup` of that schema, plus « Sans groupe » |
| voies / simulation de panne | not applicable |
| Étiquettes *Moyens / Identifiants / Aucune* | *Colonnes* (FK / referenced column names at each end, hidden on edges shorter than 150 px), *Noms* (ref name, else cardinality), *Aucune* |
| (no equivalent) | « Cartes » toolbar setting: *Clés* (PK + FK columns, then « + n colonnes », default), *Toutes*, *Titre* (name and column count) |
| (no equivalent) | self-references (`categories.parent_id > categories.id`) are drawn as a loop on the right of the card (`edgeGeom`, `kind: 'self'`) |

## Hard constraint: one self-contained file

The whole app is `src/index.html` — HTML, CSS and JavaScript inline, opened directly from disk (`file://`):

- No build step, no package manager, no server. `scripts/` only holds maintenance helpers run with Node.
- No external resources (CDN scripts, web fonts) — this is why the DBML parser is hand-written instead of using `@dbml/core`. A `Content-Security-Policy` meta tag (`default-src 'none'`, inline script/style only) blocks any network request.
- Vanilla JS and inline SVG. Fonts are system stacks only: Segoe UI for the UI, Cascadia Code/Mono/Consolas for every identifier (tables, columns, types, DBML). The look is a compact developer tool (by request): neutral surfaces, 1 px borders, segmented controls, a status bar; colour tokens on `:root` with a `prefers-color-scheme: dark` block. Amber (`--warn`) is reserved for edit mode, blue `--accent` for selection and primary actions, `--rel-n1/11/nn` for cardinalities.
- Colours coming from DBML (`headercolor`, `color`) are restricted to `#rgb` / `#rrggbb` in `normalize()` because they reach CSS and SVG attributes. User text is always set as text nodes, never via `innerHTML`.

## Architecture (inside `src/index.html`'s `<script>`)

- **Model** (`state`, persisted in `localStorage` under `dbviz.v1`): `{project, tables, refs, enums, groups, notes}`.
  - `tables[]` `{id, schema, name, alias, color, note, columns[], indexes}` — `columns[]` `{name, type, pk, increment, notNull, unique, default, note}` with `default` = `{kind: 'str'|'expr'|'raw', v}`; `indexes` is kept as raw DBML text (round-tripped, not interpreted yet).
  - `refs[]` `{id, name, from: {table, columns[]}, to: {table, columns[]}, rel: '>'|'-'|'<>', onDelete, onUpdate}` — `<` is normalised to `>` by swapping ends, so `from` is always the many / FK side; inline `ref:` column settings become standalone refs. `table` fields hold `tableKey()` (`schema.name`, or `name` without schema).
  - `groups[]` `{name, color, note, tables[]}` (table keys), `enums[]`, `notes[]` (standalone `Note` blocks), `project` `{name, settings[], note}`.
- **`parseDbml(src)`**: tokenizer (`tokenize`) + recursive descent; throws `DbmlError` with a line number. **`normalize(model)`** is the single entry point for untrusted data (storage, import, sample): it assigns ids, resolves aliases and `public.` prefixes, validates colours and drops dangling references, filling `issues` (shown in the detail panel). Any new field must be handled there. **`toDbml(model)`** writes canonical DBML (refs always standalone, at the end).
- **Mutations**: mutate `state` in place then `commit()` (save, undo history of 20 snapshots in memory — `undo()` / Ctrl+Z / « ↶ », edit mode only —, render). Whole-model swaps (import, sample, DBML tab) go through `replaceState()`, which also resets `planPos` and the camera. `cleanUi()` drops UI references to things that no longer exist. Tables are identified everywhere by `tableKey()`, groups by name: renaming a table goes through `moveTableKey()` (refs, groups, `planPos`, `ui`), renaming/removing columns is applied to refs by `openTableEditor()` (refs on a removed column are deleted after `confirm()`).
- **UI state** (`ui`, never persisted with the data): `edit`, `selected` (`{type: 'table'|'ref'|'group', id}`), `focus` (table key), `group`, `schema`, `labels`, `cards`, exclusion sets `hideRel` / `hideGroups` (so new items are visible by default), `tab` (`detail` | `source`), `srcDraft` / `srcError` (DBML tab).
- **Graph** (port of UrbaComm's engine — keep the two in step): `sceneSpec()` picks `plan` / `table` / `group` / `schema`; `buildScene()` builds `{nodes, edges, titles, target, refs}` with `planTargets()` (plan: group blocks with per-row heights, groups placed so the most linked are neighbours, `planPos` overrides), `flowLayout()` (focus scenes: emitters = FK holders on the left, referenced tables on the right, barycentre sweeps, card scale by degree, edges bowed around cards) and `constellation()`. Cards are measured with the real SVG font (`cardSize()`, cached per scene in `cardCache`), drawn by `tableNode()`; edges by `edgeElement()` / `edgeGeom()` (quadratic, or cubic loop for self refs); markers are per cardinality (`#arrow-n1|11|nn`, coloured by CSS). `renderGraph()` tweens from the previous scene (`tweenTo`, `fitCamera`, 560 ms, instant with reduced motion); changing the « Cartes » setting forces a relayout by clearing `sceneIdentity`. `applyHighlight()` dims to 13 %. Pointer gestures: click card = focus, click edge = select ref, click frame = select group, drag background = pan, wheel = zoom ×0.15–×4; edit mode: drag card → card opens `openRefEditor(null, refPreset(a, b))` (guesses `<table>_id`-style FK columns), Shift+drag moves, double-click background creates a table (in the frame under the pointer), double-click a card edits it (single click deferred by `clickTimer`).
- **Editors** (one `<dialog id="editor">`, `openDialog()` shows validation errors inline): `openTableEditor()` (fields + editable column grid with reorder), `openRefEditor()` (live `Ref:` preview), `openGroupEditor()`; `removeTable()`, `removeRef()`, `removeGroup()`. All refuse when `!ui.edit`.
- **Rendering**: `renderAll()` → header, graph, context bar (back to plan, scene crumb, ref count, group / schema selectors, « Aller à une table » search with `/`), toolbar (Cartes, Étiquettes, Filtres, Légende, Éclater — `ui.spread`, on by default: wider gaps via `spread()`, card swaps within a group / ring by `untangle()` to cut crossings and arrows over cards, `routeEdges()` bends on every scene —, Recentrer, edit hint), side tabs (`renderDetail()`: table, ref, group or synthesis; `renderSource()`: DBML text, read-only unless editing, « Appliquer » / Ctrl+Enter, error with line selection, not re-rendered while the textarea has focus), status bar (counts, zoom, mode).
- **Import / export**: `importDbml()` (edit mode only, 5 MB max), `loadSample()` (edit mode only), `exportDbml()` and « Copier » in the DBML tab (always available — reading is not modifying).
- **DOM helpers**: `h()` (HTML) and `s()` (SVG) flatten nested children and skip `null`; use `fill(el, …)` rather than `replaceChildren()`.

## Running and checking

- Run: open `src/index.html` in a browser.
- Syntax check of the inline script (Git Bash):
  `sed -n '/<script>/,/<\/script>/p' src/index.html | sed '1d;$d' > /tmp/app.js && node --check /tmp/app.js`
- Parser round trip: extract the code between `function emptyModel` / `Aides DOM` and `class DbmlError` / `Accès au modèle` with Node, then check `normalize(parseDbml(toDbml(m)))` equals `m` (ignoring `line`) on every file of `exemples/`. Do this after any change to the parser or the serializer.
- Headless screenshot (Edge ships with Windows):
  `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --force-prefers-reduced-motion --window-size=1400,800 --virtual-time-budget=2000 --screenshot=shot.png "file:///C:/.../src/index.html"`
  To exercise a state, write a copy of the page with an extra `<script>setTimeout(() => {...}, 200)</script>` before `</body>` calling app functions (`setEditMode(true)`, `focusTable('commandes')`, `showGroup('ventes')`, `ui.schema = 'x'; renderAll()`, `openTableEditor(tableByKey('produits'))`, `openRefEditor(null, refPreset('a', 'b'))`), and use `--dump-dom` to read results back (e.g. errors collected into a `data-` attribute). Generate the copy with Node, not sed. Use a fresh `--user-data-dir` for every run: the profile keeps `localStorage`, so a second run would start from the first run's modified model. Stub `window.confirm = () => true` before driving deletions.
- Check light and dark (`--force-dark-mode --blink-settings=preferredColorScheme=0`) on each scene before concluding.

There are no automated tests yet.

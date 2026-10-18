# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DBViz visualises a **relational database model** read from a [DBML](https://dbml.dbdiagram.io/docs/) file: tables, columns, references (foreign keys) and table groups. It imports DBML, lets the user edit the model, and exports it back to DBML. The user is French: the UI, README, CHANGELOG and `docs/` are in French; code identifiers and this file are in English.

Repository layout: `src/index.html` (the app), `exemples/` (importable DBML files; `boutique.dbml` is copied into the in-app `SAMPLE` constant by `node scripts/sync-exemple.js` — re-run it whenever the file changes), `docs/format-dbml.md` (user-facing description of the supported DBML subset, in French — keep it in sync with `parseDbml()` / `toDbml()`), `README.md`, `CHANGELOG.md` (French, Keep a Changelog style). No license: all rights reserved. Line endings are LF (`.gitattributes`, `.editorconfig`). Git default branch: `main`.

## Conventions shared with the user's other projects (skills)

Two project skills live in `.claude/skills/` and **must** be followed; they are copies of `../skills/` (the user's source of truth, shared with UrbaComm — re-copy them if that folder changes, don't edit the copies alone):

- **`mode-edition`** — read-only by default, padlock in the header + E key, `localStorage` key `dbviz.edition`, `body.editing` amber underline, every modification affordance gated by `editBtn()`-style helpers, and defence in depth (mutating functions refuse when `!ui.edit`). Already implemented in the skeleton: `setEditMode()`, `editBtn()`, `lockIcon()`, the keydown handler, `renderHeader()`.
- **`graphe-reseau`** — scenes, flow and constellation layouts, visual encoding, interactions, transitions and graph editing gestures. Reference implementation: `../UrbaComm/src/index.html` (`buildScene`, `flowLayout`, `planTargets`, `constellation`, `tweenTo`, `fitCamera`, `measure`, `boundary`). Reuse its code shape rather than reinventing it.

### Mapping graphe-reseau → DBML (agreed defaults, confirm with the user before departing from them)

| graphe-reseau | DBViz |
|---|---|
| entité | **table** — card with the table name in bold and its schema; group colour bar on the left (`TableGroup` colour, else `headercolor`) |
| groupe | **`TableGroup`**; tables in no group go in an implicit « Sans groupe » frame |
| lien direct | **`Ref`** between two tables; « sens » = from the table holding the foreign key (`ref.from`) to the referenced table (`ref.to`), so in focus scenes **child tables are on the left, referenced tables on the right**; `-` (one-to-one) and `<>` (many-to-many) are bidirectional |
| criticité (colour / thickness) | **cardinality** (`>` many-to-one, `-` one-to-one, `<>` many-to-many); dashed line when the FK column is nullable |
| lien multipartite (diamond) | not used for now (a future option: show junction tables of `<>` relations as diamonds) |
| focus entité | click on a table: its references in the left → right flow layout |
| focus thème | a `TableGroup` chosen: the references touching it |
| constellations par période | one constellation per schema (only if the model has several schemas) |
| voies / simulation de panne | not applicable |
| Étiquettes *Moyens / Identifiants / Aucune* | *Colonnes* (FK → PK column names at each end), *Noms* (ref names), *Aucune* |

Column lists inside cards are an open design question (plan: header only; focus: columns shown?). Ask the user before deciding.

## Hard constraint: one self-contained file

The whole app is `src/index.html` — HTML, CSS and JavaScript inline, opened directly from disk (`file://`):

- No build step, no package manager, no server. `scripts/` only holds maintenance helpers run with Node.
- No external resources (CDN scripts, web fonts) — this is why the DBML parser is hand-written instead of using `@dbml/core`. A `Content-Security-Policy` meta tag (`default-src 'none'`, inline script/style only) blocks any network request.
- Vanilla JS and inline SVG. Fonts are system stacks only (Bahnschrift semi-condensed for display, Segoe UI for body, Cascadia Mono/Consolas for code).
- Colours coming from DBML (`headercolor`, `color`) are restricted to `#rgb` / `#rrggbb` in `normalize()` because they reach CSS and SVG attributes. User text is always set as text nodes, never via `innerHTML`.

## Architecture (inside `src/index.html`'s `<script>`)

- **Model** (`state`, persisted in `localStorage` under `dbviz.v1`): `{project, tables, refs, enums, groups, notes}`.
  - `tables[]` `{id, schema, name, alias, color, note, columns[], indexes}` — `columns[]` `{name, type, pk, increment, notNull, unique, default, note}` with `default` = `{kind: 'str'|'expr'|'raw', v}`; `indexes` is kept as raw DBML text (round-tripped, not interpreted yet).
  - `refs[]` `{id, name, from: {table, columns[]}, to: {table, columns[]}, rel: '>'|'-'|'<>', onDelete, onUpdate}` — `<` is normalised to `>` by swapping ends, so `from` is always the many / FK side; inline `ref:` column settings become standalone refs. `table` fields hold `tableKey()` (`schema.name`, or `name` without schema).
  - `groups[]` `{name, color, note, tables[]}` (table keys), `enums[]`, `notes[]` (standalone `Note` blocks), `project` `{name, settings[], note}`.
- **`parseDbml(src)`**: tokenizer (`tokenize`) + recursive descent; throws `DbmlError` with a line number. **`normalize(model)`** is the single entry point for untrusted data (storage, import, sample): it assigns ids, resolves aliases and `public.` prefixes, validates colours and drops dangling references, filling `issues` (shown in the detail panel). Any new field must be handled there. **`toDbml(model)`** writes canonical DBML (refs always standalone, at the end).
- **Rendering**: `renderAll()` → `renderHeader()`, `renderToolbar()`, `renderGraph()` (placeholder, to be written per graphe-reseau), `renderDetail()` (synthesis when nothing is selected). Mutations mutate `state` in place and call `commit()` (save + render). UI-only state lives in `ui` (`edit`, `selected`, later `focus`, `group`, `labels`…), never persisted with the data.
- **Import / export**: `importDbml()` (edit mode only, 5 MB max), `loadSample()` (edit mode only), `exportDbml()` (always available — reading is not modifying).
- **DOM helpers**: `h()` flattens nested children and skips `null`; use `fill(el, …)` rather than `replaceChildren()`.

## Running and checking

- Run: open `src/index.html` in a browser.
- Syntax check of the inline script (Git Bash):
  `sed -n '/<script>/,/<\/script>/p' src/index.html | sed '1d;$d' > /tmp/app.js && node --check /tmp/app.js`
- Parser round trip: extract the code between `function emptyModel` / `Aides DOM` and `class DbmlError` / `Persistance` with Node, then check `normalize(parseDbml(toDbml(m)))` equals `m` (ignoring `line`) on every file of `exemples/`. Do this after any change to the parser or the serializer.
- Headless screenshot (Edge ships with Windows):
  `"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --force-prefers-reduced-motion --window-size=1400,800 --virtual-time-budget=2000 --screenshot=shot.png "file:///C:/.../src/index.html"`
  To exercise a state, write a copy of the page with an extra `<script>setTimeout(() => {...}, 200)</script>` before `</body>` (e.g. `setEditMode(true)`); generate the copy with Node, not sed.

There are no automated tests yet.

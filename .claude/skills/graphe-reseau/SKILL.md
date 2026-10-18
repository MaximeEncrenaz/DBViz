---
name: graphe-reseau
description: Convention commune à mes projets pour les graphes de réseau (entités reliées par des liens, rangées en groupes) — scènes (plan d'ensemble, focus sur une entité, focus sur un thème, constellations par période), mise en page en flux gauche → droite et en constellation, encodage visuel, interactions souris/clavier, transitions, caméra et gestes du mode édition. À appliquer dès qu'on crée, modifie ou revoit une vue graphe (SVG, canvas ou bibliothèque) dans un de mes projets.
---

# Graphe de réseau : scènes, focus, constellations, édition

Mes applications montrent souvent **qui est relié à qui** : des *entités* (dans UrbaComm, les rôles), rangées en *groupes*, reliées par des *liens* directs (2 entités) ou *multipartites* (≥ 2, ex. audioconférence) qui portent une *criticité*, un *sens* et des *voies* (nominale puis secours). La vue graphe doit se comporter **de la même façon dans tous les projets**. Adapter le vocabulaire et la technique, pas les règles.

Implémentation de référence : `UrbaComm/src/index.html` (SVG en ligne écrit à la main, hors ligne, sans bibliothèque).

## 1. Scènes

Le graphe affiche une **scène** à la fois. Elle est déduite de l'état d'interface, dans cet ordre de priorité :

| Priorité | État | Scène | Contenu |
|---|---|---|---|
| 1 | une entité focalisée (`ui.focus`) | **focus entité** | ses liens visibles, mise en page en flux (§ 3), elle au centre |
| 2 | un thème choisi (activité…) | **focus thème** | les liens du thème, en flux, l'entité la plus reliée au centre |
| 3 | une période choisie (phase…), pas de thème | **constellations** | une constellation par thème de la période, en grille (§ 4) |
| 4 | rien | **plan d'ensemble** | toutes les entités visibles, par groupe (§ 2) |

- Chaque scène autre que le plan a un **titre** au-dessus : « CODE · intitulé — n liens » ou « Thème · période — n liens ».
- La barre de contexte indique la scène (« n liens affichés sur N », « Constellation du rôle »…) et propose **« ◂ Plan d'ensemble »** hors du plan.
- Les filtres (criticité, type de flux, groupes, système…) s'appliquent à toutes les scènes ; une entité d'un groupe masqué disparaît partout.

## 2. Plan d'ensemble

- Chaque groupe est une **grille serrée de cartes**, plus haute que large (les cartes sont larges), entourée d'un **cadre** rectangulaire ajusté à ses membres : fond teinté de la couleur du groupe à 6 %, bordure en tirets, nom du groupe en capitales au-dessus.
- Les groupes sont placés sur une grille où **les groupes les plus liés entre eux sont voisins**.
- Les losanges multipartites sont repoussés hors des cadres, dans les couloirs entre groupes.
- Mise en page **déterministe** (même données → même plan) et calculée d'un coup, sans simulation animée.
- Une carte déplacée à la main garde sa place (mémoire de positions, non enregistrée avec les données) et prime sur la mise en page.

## 3. Focus : mise en page en flux gauche → droite

Pour le focus entité et le focus thème. L'objectif est la **lisibilité** : centre évident, sens de lecture, minimum de croisements.

1. **Centre** : l'entité focalisée ; pour un thème, la plus reliée (à égalité : la plus équilibrée entre émission et réception, puis l'ordre des groupes). Elle est à x = 0, **en plus grand**, et la caméra se cadre **symétriquement autour d'elle**.
2. **Score émetteur / destinataire** de chaque entité, calculé sur les liens de la scène : émet = envoie un lien unidirectionnel ou ouvre un lien multipartite ; reçoit = reçoit un lien unidirectionnel ou une diffusion. Score = (reçus − émis) / (reçus + émis), 0 si seulement bidirectionnel.
3. **Colonnes** = côté × distance au centre dans le graphe (correspondants directs en ±1, les leurs en ±2…). **Émetteurs à gauche, destinataires à droite.**
   - Correspondant direct au score non nul : côté du score.
   - Seulement bidirectionnel : côté de ses correspondants *directs* déjà placés, sinon côté le moins rempli (équilibre).
   - Relié au centre **seulement par un lien multipartite** : placé **en bloc** avec les autres participants de ce lien, du côté de ceux déjà placés, sinon le moins rempli (ses traits ne traversent pas la scène).
   - Au-delà de la distance 1 : côté de ses voisins plus proches du centre, pour qu'aucun trait ne repasse par-dessus le centre.
4. **Losanges multipartites** en demi-colonne, à mi-chemin de leurs participants, jamais sur la colonne du centre.
5. **Ordre dans chaque colonne** : balayages par barycentre (≈ 8 passes, de l'intérieur vers l'extérieur puis inversement), chaque colonne empilée sans chevauchement autour de ses ordonnées cibles.
6. **Taille des cartes** proportionnelle au nombre de liens (×0,95 à ×1,4 ; centre ≥ ×1,45), intitulés moins tronqués qu'au plan.
7. **Écartement** des colonnes selon leur carte la plus large + ~190 px (place pour les étiquettes aux deux bouts) ; plus serré pour une demi-colonne de losanges.
8. **Contournement** : un trait direct qui traverserait une carte est courbé du côté le plus dégagé (essais de décalage croissants, on garde le premier sans collision).

Limite acceptée : si tous les correspondants sont du même côté, la scène reste d'un seul côté plutôt que de créer des croisements.

## 4. Constellations (vue par période)

- Une constellation par thème, plus « Sans thème » s'il y a des liens non rattachés ; disposées en **grille serrée** (chaque ligne et colonne prend la taille de sa plus grande constellation).
- Dans chacune : l'entité la plus reliée au centre **s'il y en a une nettement** (≥ 4 entités et un degré strictement supérieur au suivant), les autres sur un **cercle rangé par groupe** puis par code, rayon ∝ nombre d'entités ; les losanges sur un **anneau intérieur** (≈ 0,52 R), écartés pour ne pas se chevaucher.
- Une même entité peut figurer dans plusieurs constellations : les clés d'éléments sont préfixées par constellation (`k0|p:<id>`, `k0|c:<lien>`).

## 5. Encodage visuel

- **Entité** : carte arrondie (code en gras + intitulé), barre verticale de la couleur de son groupe à gauche ; texte mesuré avec la vraie police pour dimensionner la carte ; les traits s'arrêtent au bord de la carte.
- **Lien** : couleur = criticité ; épaisseur = niveau (3 / 2,2 / 1,6 px) ; flèches aux deux bouts si bidirectionnel, une seule (émetteur → destinataire) si unidirectionnel ; plusieurs liens entre les deux mêmes entités : courbes de part et d'autre.
- **Lien multipartite** : losange de la couleur de criticité avec son identifiant dessous ; un trait par participant, flèche épaisse depuis l'initiateur, flèches vers les participants si diffusion.
- **État simulé** : sur secours → tirets ; perdu → pointillés gris. Étiquettes : « ✕ » pour un moyen perdu, « (S) » pour un secours.
- **Étiquettes** au choix dans la barre d'outils : *Moyens* (moyen nominal à chaque bout, « +n » secours), *Identifiants*, *Aucune* ; texte avec halo de la couleur du fond.
- **Légende** repliée dans la barre d'outils du graphe (bouton « Légende »), qui se déplie au-dessus : types de traits, losange, secours, perdu, couleurs de criticité.
- Fond en grille de points discrète ; tout passe par les jetons de couleur du thème (clair et sombre).

## 6. Interactions

| Geste | Effet |
|---|---|
| Clic sur une carte | **focus** sur l'entité (scène § 3) et sélection |
| Clic sur un trait ou un losange | sélection du lien (panneau de détail) |
| Clic sur un cadre de groupe | sélection du groupe |
| Clic sur le fond | désélection |
| Glisser le fond | déplacer la vue |
| Glisser une carte (lecture seule) | la déplacer ; au plan, sa position est retenue |
| Molette | zoom centré sur le pointeur, borné ×0,15 – ×4 |
| « Recentrer » | recadrer la scène |
| Échap | d'abord désélectionner, puis revenir au plan d'ensemble |

- Un mouvement de moins de 3 px compte comme un clic.
- **Sélection** : l'élément sélectionné et ses voisins restent nets, tout le reste passe à 13 % d'opacité ; l'entité sélectionnée a une bordure encre, l'entité centrale une bordure d'accent ; un groupe sélectionné renforce son cadre.
- Le panneau de détail suit la sélection ; sans sélection, il affiche une synthèse.

## 7. Transitions et caméra

- Changer de scène **anime** chaque élément depuis la position qu'avait **la même entité / le même lien** dans la scène précédente vers sa cible, caméra comprise (≈ 560 ms, cubique entrée-sortie). Re-rendre la même scène garde les positions.
- `prefers-reduced-motion` : transitions instantanées (et le premier cadrage est calculé de façon synchrone).
- Cadrage automatique : englobe cartes, losanges, titres et cadres avec une marge, zoom borné ×0,2 – ×1,4 ; symétrique autour du centre dans les scènes de focus.
- Toute interaction (glisser, molette) interrompt une animation en cours.

## 8. Édition dans le graphe

Le mode édition suit le skill **mode-edition** (cadenas, touche E, lecture seule par défaut). Dans le graphe, en édition seulement :

- **Double-clic sur le fond** : nouvelle entité ; dans le cadre de groupe sous le pointeur s'il y en a un (elle rejoint sa grille), sinon épinglée à l'endroit du double-clic. Hors du plan, on revient au plan avec la nouvelle entité sélectionnée.
- **Glisser d'une carte à une autre** : trait provisoire en tirets d'accent, carte cible surlignée ; au relâcher, éditeur de lien prérempli (les deux entités, voie nominale sur un moyen commun s'il en existe un).
- **Maj + glisser** : déplacer une carte (le glisser simple sert à relier).
- Une aide rappelle ces gestes dans la barre d'outils du graphe. Le curseur sur une carte est en croix.
- En lecture seule, aucun de ces gestes ne crée ni ne modifie quoi que ce soit.

## 9. Vérifier avant de livrer

1. Les quatre scènes s'affichent, avec titre et bouton « ◂ Plan d'ensemble » hors du plan ; Échap désélectionne puis revient au plan.
2. Focus entité et focus thème : centre au milieu de l'écran et en plus grand, émetteurs à gauche, destinataires à droite, pas de trait qui traverse une carte quand on peut l'éviter.
3. Passage plan → focus → plan : chaque entité glisse depuis sa position précédente ; instantané avec `--force-prefers-reduced-motion`.
4. Sélection : estompage à 13 % de tout ce qui n'est pas concerné.
5. Simulation de panne : tirets / pointillés et étiquettes « (S) » / « ✕ » cohérents.
6. Lecture seule : double-clic et glisser carte → carte sans effet ; édition : les trois gestes fonctionnent.
7. Thèmes clair et sombre lisibles ; captures sans navigateur (Edge headless) sur chaque scène avant de conclure.

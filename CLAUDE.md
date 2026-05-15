# CLAUDE.md — Outil ANV (contrôleur recouvrement)

## Qui je suis et pour quoi je fais ce projet (lis ça en premier)

Je suis **contrôleur de recouvrement**. Je construis ce projet **seul**, pour **moi** (et peut-être quelques collègues plus tard), dans le but **d'optimiser mes tâches quotidiennes au travail** et de gagner un maximum de temps.

**Mes contraintes réelles** :
- Je suis **amateur**, je ne code pas bien. Je t'utilise dans Claude Code comme pair programmer.
- **Au boulot, je n'ai le droit d'installer aucune application.** Donc : site web 100 % statique, hébergé en public sur **GitHub / GitHub Pages**, ouvrable dans n'importe quel navigateur.
- **Aucune donnée client dans le repo.** Jamais de noms, numéros de dossier, IBAN, montants réels, captures d'écran internes, ou quoi que ce soit de confidentiel — le repo est public.
- Tout doit fonctionner **offline** une fois la page chargée (le seul accès réseau autorisé aujourd'hui est le CDN Tailwind — on pourra l'inliner plus tard si besoin).

**Comment me parler** :
- En **français simple**. Quand tu utilises un terme technique (event listener, closure, refactor, XSS, IIFE…), explique-le en une phrase la première fois avec un exemple tiré de MON code.
- Ne suppose pas que je connais. Si une notion est nécessaire pour suivre, explique-la avant de l'utiliser.
- **Confirme avant toute action destructive ou irréversible** (`rm`, `git reset --hard`, overwrite). Propose toujours un commit de sauvegarde avant un gros changement.
- **Si je te demande un truc qui a une meilleure alternative plus simple, dis-le AVANT de coder.** Challenge-moi, ne me flatte pas.
- **Pousse-moi à faire mieux.** À la fin de chaque tâche non-triviale, signale 1 à 3 pistes auxquelles je n'ai probablement pas pensé (sans partir les faire — juste les mentionner).
- **Une modif à la fois.** Jamais d'enchaînement sans que j'aie testé dans le navigateur entre deux.

---

## 🎯 Étoile polaire du design : MOINS DE CLICS, PLUS DE VITESSE

**Tout choix doit se juger à cette aune.** Avant de proposer une feature, une animation, une modale, une étape supplémentaire, pose-toi la question : *« est-ce que ça fait gagner du temps à l'utilisateur, ou est-ce que ça en coûte ? »*

Concrètement :
- Pas de confirmations modales sauf danger réel
- Pas d'animations qui font attendre (d'où le `animation: none !important`)
- Chemins fréquents = les plus courts (le motif le plus utilisé doit être à 1 clic, pas 3)
- Raccourcis clavier bienvenus (touches numériques pour les choix, Esc pour revenir)
- L'état se restaure automatiquement quand c'est utile (ex : le contexte global COMPTE/STATUT est déjà persisté, c'est le bon pattern)

Si tu vois une occasion d'économiser un clic ou une seconde, signale-la.

---

## Cas d'usage concret (type)

Pendant ma journée, je traite plusieurs dossiers à la chaîne. Pour chaque dossier :

1. J'ai déjà sélectionné **une fois** mon contexte global (COMPTE = ACTIF ou RADIÉ, STATUT = A/C ou PL) au début — persisté en localStorage, je n'y retouche plus.
2. Je clique sur la catégorie (ex : **ANV**).
3. Je clique sur le motif (ex : **11 - INSOLVABILITÉ**).
4. Si nécessaire, je clique sur un sous-motif (ex : **01 - PV DE CARENCE**).
5. La page me sort le **résultat final** : un ou plusieurs blocs avec **titre** (ex : objet du courrier) et **texte** (corps du courrier en HTML riche).
6. Je clique **Copier** → je colle dans Word / Outlook → j'envoie au débiteur (usager).
7. Dossier suivant.

**Objectif chiffré implicite** : un dossier doit se traiter en **~5 secondes + le temps de coller**. Tout ce qui rallonge ce parcours est suspect.

---

## Fichiers du projet

- `data.js` — source de vérité de l'arborescence. Expose `globalContextOptions` + `treeData` sur `window`.
- `index.html` — UI complète en un seul fichier : CSS custom + Tailwind CDN + JS en IIFE.

**Tout tient dans ces deux fichiers.** Ne rien splitter sans me demander.

## Stack et contraintes visuelles

- **Tailwind** via `https://cdn.tailwindcss.com` (pas de config, pas de purge).
- **Police imposée** : Aptos → Calibri → Arial, forcée via `!important`, 11pt, `text-transform: uppercase`, `letter-spacing: 0.08em`. Tout le texte s'affiche en MAJUSCULES par CSS.
- **Thème sombre** via variables CSS : `--bg-1`, `--ink`, `--accent` (doré `#c7a66b`), `--surface`, `--surface-strong`, `--muted`, `--muted-strong`.
- **Animations désactivées globalement** (`animation: none !important; transition: none !important`). Choix délibéré pour la vitesse. Ne pas réactiver.

## Règles dures (ne JAMAIS casser)

1. `window.treeData` et `window.globalContextOptions` sont exposés à la fin de `data.js`. Ne pas renommer ni supprimer l'exposition.
2. Pas de framework (React, Vue…), pas de bundler, pas de npm, pas de nouvelle dépendance externe hors le Tailwind CDN déjà là.
3. **Aucune donnée confidentielle dans le repo.** Tous les exemples de textes de courrier sont génériques (`Madame, Monsieur, …`), jamais de noms réels, jamais de numéros de dossier réels, jamais de montants réels. Si tu vois passer une vraie donnée, alerte-moi.
4. **Tout contenu dynamique venant de `data.js` passe par `escapeHtml()` avant injection.** **Seule exception intentionnelle** : `resultats[].texte` est injecté en HTML riche via `innerHTML` (nécessaire pour que le bouton "Copier" colle du rich text via `ClipboardItem` `text/html`). Tout nouveau champ doit être échappé par défaut.
5. Conserver les commentaires pédagogiques en tête de `data.js` — ils me servent si j'édite l'arbre sans passer par Claude.
6. Ne pas renommer ces **IDs DOM** : `questionZone`, `inlineTitleContainer`, `choicesContainer`, `choicesHeader`, `inputsContainer`, `togglesContainer`, `cascadeFlow`, `contextPanel`, `entryLayout`, `mainPanel`, `breadcrumbs`, `breadcrumbsSection`, `resultsContainer`, `inlineBackArrow`, `copyPathBtn`. Note : `inputsContainer`, `choicesHeader`, `choicesContainer` sont conservés pour compat mais cachés (le rendu réel passe par `cascadeFlow`).
7. Ne pas renommer ces **classes CSS custom** : `surface-shell`, `surface-card`, `text-muted`, `text-strong`, `brand-button`, `context-option`, `is-selected`, `motif-label`, `motif-code`, `motif-text`, `page-shell`, `context-dock`, `choice-grid-root`, `copy-success`, `fade-in`, `pop-in`, `floating-reset`, `card-row`, `card-row-label`, `card-row-content`, `card-row-inline`, `pill-btn`, `card-input`, `card-textarea`, `back-arrow-btn`, `leaf-input-wrap`, `leaf-input-label`, `result-card`, `result-header`, `result-body`, `result-sub`, `result-content`, `empty-tag`, `empty-choice`, `image-paste-zone`, `image-placeholder`.

## Schéma de `data.js`

### Nœud intermédiaire (cascade classique)

```js
{
  question: "Titre affiché",            // optionnel (caché en mode inline)
  inputs: [
    {
      id: "date",                       // identifiant pour {{date}} dans les templates
      label: "DATE",                    // label affiché à gauche du champ
      type: "text",                     // "text" (défaut), "textarea", ou "image"
      placeholder: "",
      // optionnels :
      conditions: { statut: ["PL"], "motif-id": ["motif-14-..."] }, // n'apparaît que si match
      inline: true,                     // regroupe avec l'input suivant sur la MÊME card-row
      transform: "ecritures-compte",    // nettoyage auto au paste (cf. plus bas)
    }
  ],
  choicesTitle: "MOTIF",                // titre de la rangée de choix (slug pour {{motif-*}})
  choix: [
    {
      id, label, description,
      conditions: { ... },              // optionnel : filtrage selon vars
      defaultInputs: { date: "today" }, // optionnel : pré-remplit nodeInputs au clic (si vide)
      defaultInputsConditions: { ... }, // optionnel : limite le pré-remplissage à un contexte
      suite: { ... }                    // sous-niveau (cascade ou feuille)
    }
  ],
  // optionnels :
  toggles: [...],                       // toggles affichés dans togglesContainer (cf. plus bas)
  topQuestions: [...],                  // questions OUI/NON optionnelles (cf. plus bas)
}
```

### Feuille (fin de parcours — résultat à copier)

```js
suite: {
  resultats: [
    // Bloc simple
    { id, label, type: "simple", texte: "...", if: { statut: ["A/C"] } },

    // Bloc multi : plusieurs sub-blocs copiables sous un même titre
    {
      id, label, type: "multi", if: {...},
      mergeWithCompositeIfSingle: "id-du-composite",  // optionnel : fusion auto si solo
      mergedLabel: "POST-IT TI & WATT",
      blocs: [
        { id, texte, if: {...} },
      ],
    },

    // Composite : combine d'autres sub-blocs en un seul texte
    {
      id, label, type: "composite", if: {...},
      combine: ["id-bloc-1", "id-bloc-2"],
      separator: "<br>+<br>",
      appendFragments: ["id-fragment"],   // optionnel : fragments en suffixe
      appendSeparator: "<br><br>",        // séparateur dédié pour les append (≠ combine)
    },

    // Fragment : sub-bloc invisible, juste référencé par un composite via combine/appendFragments
    { id, type: "fragment", texte: "...", if: { ficoba: ["non"] } },
  ]
}
```

### Toggles (cases à cocher au-dessus de la cascade)

Un toggle est une case à cocher qui, quand activée, **remplace** le contenu de la cascade par sa `whenOn`. Sont stockés dans `node.toggles` (où `node` est `inlineRootNode` ou un parent dans le stack).

```js
{
  id: "amiable-reldet",
  label: "AMIABLE RELDET",
  whenOn: {                             // structure de cascade complète
    choicesTitle: "VERSEMENT RÉCENT",
    choix: [...],
    toggles: [...],                     // imbriqué possible (ex: DETTE NON EXIGIBLE dans AMIABLE)
    topQuestions: [...],
  }
}
```

Les toggles sont **imbriquables** via une stack (`activeToggleStack`). Désactiver un toggle parent désactive tous les enfants au-dessus.

### TopQuestions (questions OUI/NON optionnelles)

Apparaissent dans la rangée des toggles (si attachées à un toggle activé) ou dans la cascade après les choix d'un niveau (si attachées à un nœud de `inlineChain`). Re-cliquer désélectionne (retour au défaut).

```js
topQuestions: [
  { id: "compte-en-ligne", label: "COMPTE EN LIGNE OU MAIL ?" },
  { id: "ficoba",          label: "FICOBA DISPONIBLE ?" },
]
```

Les réponses sont stockées dans `topAnswers[id]` (= `"oui"` / `"non"` / `undefined`). Disponibles dans les templates et dans les `if`.

### LeafQuestions étendues (autres valeurs que oui/non)

Les `leafQuestions` acceptent un champ optionnel `choices` pour proposer d'autres valeurs que `oui`/`non`. Cas d'usage : `AE OU TI ?` (DÉLAI) ou `INSTRUCTIONS CJ` (RÉEXÉCUTION).

```js
leafQuestions: [
  { id: "dca", label: "DCA / DR À JOUR ?" },           // oui/non par défaut
  { id: "ae-ti", label: "AE OU TI ?",
    choices: ["ae", "ti"], conditions: { dca: ["non"] } },
  { id: "instructions-cj", label: "INSTRUCTIONS CJ",
    choices: ["defaut", "s att", "com"] },
]
```

### Conditions numériques (sur inputs ou autres vars)

Les `conditions` (sur choix, inputs, blocs résultat) acceptent en plus des arrays des objets avec opérateurs comparatifs : `>`, `<`, `>=`, `<=`, `==`, `!=`. Utile pour comparer un nombre tapé par l'utilisateur.

```js
if: { dca: ["oui"], plus50k: ["oui"], mois: { ">": 36 } }
```

Mais en pratique, on préfère calculer une variable dérivée booléenne dans `buildTemplateVars` (ex: `{{mois-gt-36}}` = `"oui"` ou `"non"`) puis utiliser `if: { "mois-gt-36": ["oui"] }`. Ça permet d'avoir un comportement par défaut quand l'input est vide.

### Conventions communes

- `id` : kebab-case, unique **à son niveau** (mais peut être réutilisé entre niveaux pour overrider).
- `label` : en MAJUSCULES (le CSS force déjà uppercase, mais on respecte la casse en JS pour l'export rich text).
- `resultats[].texte` : accepte du HTML (innerHTML). Sauts de ligne `<br>`. Caractères spéciaux `<` / `&` doivent être échappés (`&lt;` / `&amp;`).
- **Profondeur max : 8 niveaux.** M'alerter si on s'en approche.

## Variables de template (utilisables dans `texte` via `{{var}}`)

Calculées dans `buildTemplateVars()` à chaque rendu :

- `{{compte}}` / `{{statut}}` : valeur brute du contexte global (ex: `"ACTIF"`, `"PL"`).
- `{{compte-display}}` : `"actif"` (par défaut/ACTIF) ou `"radié"` (RADIÉ). Pour les phrases du type `Compte actif - …`.
- `{{motif-prefix}}` : `"ANV PARTIELLE"` (par défaut/ACTIF) ou `"ANV"` (RADIÉ). **Note** : pour le motif 13 et 14, on a écrit `ANV` en dur dans les templates (jamais PARTIELLE).
- `{{today}}` : date du jour au format `JJ/MM/AA` (auto-générée).
- `{{date}}`, `{{co-number}}`, `{{date-liq}}`, etc. : valeurs des inputs (par leur `id`).
- `{{ecritures}}` : valeur du textarea ÉCRITURES (les `\n` sont convertis en `<br>` à l'injection).
- `{{date-prescription-full}}` : RÉEXÉCUTION uniquement. La date saisie par l'utilisateur, **expand** en `JJ/MM/AAAA` (ajoute `20` devant 2 chiffres). Utiliser cette variable et **pas** `{{date-prescription}}`.
- `{{mois-gt-36}}` : DÉLAI. Vaut `"oui"` si l'input MOIS > 36, sinon `"non"` (y compris quand vide). Permet de switcher les textes selon la durée demandée.
- `{{adresse}}` : RÉEXÉCUTION. La valeur est **forcée en MAJUSCULES** dans le résultat (peu importe ce que l'utilisateur tape).
- `{{<slug>-id}}`, `{{<slug>-label}}`, `{{<slug>-code}}`, `{{<slug>-text}}`, `{{<slug>-abbrev}}` : pour chaque niveau de cascade qui a un `choicesTitle`, le slug est le titre slugifié. Ex : `{{motif-id}}`, `{{sous-motif-abbrev}}`.
- `{{dretaf}}`, `{{suspen}}`, `{{dca}}`, `{{plus50k}}`, `{{ae-ti}}`, `{{instructions-cj}}` : réponses aux leafQuestions (par leur `id`).
- `{{compte-en-ligne}}`, `{{ficoba}}`, `{{ficoba-reex}}` : réponses aux topQuestions (`"oui"` / `"non"` / vide).
- `vars.__category` (interne, non substituable dans un template) : id de la catégorie active (`"anv"`, `"delai"`, `"reexecution"`). Utilisée pour le post-traitement conditionnel.

### Post-traitement automatique de `substituteTemplate`

Appliqué à TOUT le résultat HTML après substitution :
1. **Date 4 chiffres → 2 chiffres** : `JJ/MM/AAAA` → `JJ/MM/AA`. Marche pour les inputs DATE et pour les écritures collées. **Skip dans la catégorie RÉEXÉCUTION** (où on veut au contraire 4 chiffres pour la date de prescription, via `{{date-prescription-full}}`).
2. **Si `topAnswers["compte-en-ligne"] === "non"`** : remplace `… -> RELDET + formulaire de demande délai envoyé par SCRIBE` par `… -> RELDET fait en v2 car pas de compte en ligne ni de mail pour envoyé par SCRIBE`.
3. **Si `topAnswers["ficoba"] === "non"`** : remplace `ET RECH EOPPS + FICOBA RECENTE` par `ET RECH EOPPS RECENTE` (motif 12, A/C uniquement).

## Comportements spéciaux à connaître

### Layout général

- **Layout 2 colonnes** : sidebar gauche (400px) avec COMPTE/STATUT toujours visibles ; colonne droite (flex-1) avec catégorie + parcours + résultats. Conteneur global `max-w-[1600px]`.
- **Police** : 13pt globale (forcée via `body, body *`), uppercase + letter-spacing. Aptos > Calibri > Arial.
- **Thème** : sombre, accent violet améthyste (`--accent: #8b5cf6`, `--accent-strong: #c4b5fd`). Le résultat copié reste lisible parce qu'on garde la casse réelle en JS (le CSS force juste l'affichage en majuscules).
- **Animations désactivées** globalement (`animation: none !important; transition: none !important`). Choix délibéré pour la vitesse.
- **`overflow-anchor: none`** sur tout le DOM + sauvegarde/restauration de `window.scrollY` dans `render()` → la position de scroll reste stable même quand le DOM change (ex: cliquer DRETAF=NON ne fait pas remonter la page).

### Rendu de la cascade

- Tous les nœuds visibles passent par **`#cascadeFlow`** (un conteneur unique). Pour chaque niveau de la cascade, on rend dans cet ordre : **inputs → choix → topQuestions du niveau**. Permet d'intercaler ÉCRITURES après VERSEMENT RÉCENT, FICOBA après SOUS-MOTIF, etc.
- `inputsContainer` / `choicesHeader` / `choicesContainer` existent toujours dans le DOM mais sont `hidden` (gardés pour ne pas casser des références éventuelles).
- **Inputs avec dédup par id** : si 2 inputs ont le même `id` au même niveau, le dernier qui matche les `conditions` gagne. Permet d'overrider le label de DATE en `DATE DE PARUTION JUGEMENT BODACC` pour le motif 14 PL.
- **Inputs `inline: true`** : regroupés sur la même card-row côte à côte (label en mode `leaf-input-label` violet à gauche de chaque input). Cas type : DATE BODACC + DATE PR LIQ CL IN du motif 14 PL.
- **Mode `MOTIF`** : si `choicesTitle.includes("MOTIF")`, les boutons sont rendus avec une pastille `[code]` + texte. Pour `SOUS-MOTIF` en PL, la pastille est masquée (intitulé seul).
- **Mode inline** (`inlineRootNode`) : au 1er niveau, cliquer sur un choix ne pousse PAS dans `trail` — la suite s'affiche en cascade dans la même page. Breadcrumbs cachés.

### Toggles et topQuestions

- **Toggles** (`activeToggleStack`) : stack des toggles activés. Active un toggle = swap `inlineRootNode` vers `toggle.whenOn` (avec savedRootNode dans le stack). Désactive = pop et restore. Imbriquables (ex: DETTE NON EXIGIBLE dans AMIABLE RELDET).
- **TopQuestions** (`topAnswers`) : OUI/NON, désélectionnables. Disponibles dans les vars (donc utilisables dans `if` et `texte`). Reset uniquement à la sortie de la catégorie (back ou changement de cat).

### Inputs spéciaux

- **`type: "textarea"`** + **`transform: "ecritures-compte"`** : nettoyage automatique au paste. Retire `Ecritures du compte`, compresse les espaces, retire l'espace entre nombre et `€`. Ex : `Ecritures du compte 31/03/2026    86  €    TELEPAIEMENT     COTISANT` → `31/03/26 86€ TELEPAIEMENT COTISANT`.
- **`type: "image"`** : zone de paste d'image (Ctrl+V). L'utilisateur peut cliquer dans la zone pour la focuser, OU coller depuis n'importe où sur la page (un listener `paste` global capture l'image et la dépose dans le 1er input image actif). Stockée en base64 (data URL) dans `nodeInputs[id]`. Bouton ✕ visible quand une image est présente pour la supprimer. À utiliser via `<img src="{{image-id}}" .../>` dans les templates.
- **`defaultInputs: { date: "today" }`** : pré-remplit l'input au clic sur ce choix, **uniquement si l'input est vide** (ne touche pas une saisie existante). `defaultInputsConditions` permet de limiter à un contexte (ex: motif 14 — n'auto-remplit qu'en A/C, pas en PL où la date est BODACC).

### État et persistance

- `globalSelections` (COMPTE / STATUT), `nodeSelections`, `nodeInputs`, `leafAnswers`, `leafInputs`, `topAnswers`, `activeToggleStack` : tous en mémoire JS uniquement. Persistent pendant la navigation, **se réinitialisent à chaque F5** (F5 = "nouveau dossier" dans le workflow).
- Désactivation d'un toggle ne reset pas `topAnswers` (pour conserver la réponse si l'user re-active le toggle).
- Pas de scroll auto ni de focus auto : l'utilisateur navigue à son rythme.

### Copier rich text

- **Bouton Copier** utilise `navigator.clipboard.write([new ClipboardItem({...})])` avec fallback `writeText()`. Ne pas régresser le fallback (certains navigateurs corporate sont vieux).
- `stripHtmlToText` convertit explicitement `<br>` → `\n`, `<li>` → `\n- `, `</p><p>` → `\n\n` (sans passer par `innerText` qui pose problème dans certains environnements). Permet aux apps qui collent en text/plain (Word config minimum) de garder les sauts de ligne, paragraphes et puces.
- **Limitation Word 2024 connue** : la couleur (ex: `style="color:#EE0000"`, `<font color>`) **n'est pas préservée** au copier-coller depuis le navigateur (Word 2024 force son thème de document). Solution : n'utiliser que `<strong>`/`<u>`/`<em>` qui passent fiablement, et laisser l'utilisateur appliquer la couleur à la main si vraiment besoin.

### Bouton "📋 chemin" (en bas à droite)

Bouton flottant et discret (opacité 55%) qui copie dans le presse-papier une chaîne récap de tous les choix actuels. Utile pour décrire son état à Claude en collant cette ligne. Format :

```
ACTIF + A/C + DÉLAI + REFUS - PAS DE PJ + DATE=15/03/26 + MOIS=37 + DCA NON + + DE 50 000€ OUI + AE OU TI AE
```

Construit par `getCurrentPathString()` : COMPTE / STATUT, catégorie, toggles activés, choix de la cascade, inputs remplis, leafAnswers, leafInputs, topAnswers. Format `LABEL VAL` pour les flags (OUI/NON/AE/TI), `LABEL=VALEUR` pour les inputs textuels.

## Workflow que j'attends

**Avant toute modif non-triviale** :
1. Lire `data.js` **et** `index.html` en entier.
2. Si vocabulaire métier nouveau, me poser **3 à 5 questions** de clarification avant de coder.
3. Proposer un plan en Plan Mode, attendre ma validation explicite.
4. Appliquer **une seule étape à la fois**, me laisser vérifier dans le navigateur entre chaque.
5. Après implémentation : dérouler un parcours utilisateur mentalement et lister ce qui peut casser.

**Pour les petits ajouts évidents** (typo, nouveau motif dans structure existante) : direct.

## Après chaque tâche, termine par un mini-bilan en 3 points

1. ✅ **Ce qui a été fait** (en français simple)
2. 🧪 **Ce que je dois tester dans le navigateur** (parcours précis à cliquer, console F12 à surveiller)
3. 💡 **1 à 3 pistes à creuser ensuite** — spécifiques à ce qu'on vient de toucher, jugées à l'aune de l'étoile polaire (moins de clics / plus de vitesse)

## Checklist post-modification

- [ ] Le JS parse sans erreur
- [ ] Aucune donnée client réelle ajoutée par inadvertance
- [ ] Tous les `id` sont uniques à leur niveau dans `data.js`
- [ ] Chaque nœud a **soit** `choix`, **soit** `resultats`
- [ ] Commentaires pédagogiques de `data.js` intacts
- [ ] `window.treeData` et `window.globalContextOptions` toujours exposés
- [ ] Aucun nouveau `innerHTML` avec du contenu `data.js` sans `escapeHtml()` (sauf `bloc.texte`)
- [ ] IDs DOM et classes CSS custom préservés
- [ ] Parcours complet testé + bouton Copier testé dans Word

## Ne jamais

- Ajouter une donnée client réelle / des infos confidentielles dans le code
- Ajouter un framework, un build, ou une dépendance externe
- Ajouter un appel réseau (fetch, API externe, analytics, fonts externes hors Tailwind CDN)
- Réactiver les animations / transitions globalement
- Traduire les libellés métier en anglais
- Renommer `treeData`, `globalContextOptions`, les IDs DOM ou les classes CSS custom
- Injecter du contenu dynamique via `innerHTML` sans `escapeHtml()` (sauf `bloc.texte`)
- Faire `rm`, `git push --force`, `git reset --hard` sans confirmation explicite
- Enchaîner plusieurs modifs sans que j'aie testé entre deux

## Roadmap (à jour au fil du temps)

**✅ Fait**

*Catégorie ANV* : **motifs 11, 12, 13, 14, 16** avec leurs variantes A/C / PL.
- 11 (INSOLVABILITÉ) : sous-motifs 01, 02, 06, 11. Format A/C avec `+ FICOBA RECENTE`, format PL `ANV[PARTIELLE]11: CARENCE-CONSTAT…`.
- 12 (PSA) : sous-motifs spéciaux selon statut (20/25 en A/C avec code, PV 659/MD PSA en PL sans code). Question optionnelle FICOBA DISPONIBLE qui modifie le résultat.
- 13 (DCD) : sous-motifs 1ÈRE ENQUÊTE et RELANCE. DATE auto-remplie à today au clic. Préfixe `ANV` en dur (jamais PARTIELLE).
- 14 (LIQ. JUD.) : en A/C, DATE auto-remplie ; en PL, DATE renommée en BODACC + ajout DATE PR LIQ CL IN inline.
- 16 (CRÉANCE < SEUIL) : DATE auto-remplie. A/C `… SS MOTIF 32 - CONSTAT DU {date}`, PL `ANV[PARTIELLE]16 : CREANCE < AU SEUIL - CONSTAT DU {date}`.

*ANV — Toggles* :
- **AMIABLE RELDET** : toggle dans la catégorie ANV. Cascade VERSEMENT RÉCENT → RAISON → résultat WATT (avec textarea ÉCRITURES si oui).
- **DETTE NON EXIGIBLE** : toggle imbriqué dans AMIABLE RELDET. Cascade CO/MD PSA → RAISON → résultat.
- **Question optionnelle COMPTE EN LIGNE OU MAIL ?** : modifie globalement la phrase finale RELDET si NON.

*Catégorie DÉLAI* (REFUS - PAS DE PJ) : tous les chemins DCA × 50K × MOIS couverts.
- DCA OUI / DCA NON × 50K OUI / 50K NON × MOIS ≤36 / MOIS >36 = 8 combinaisons codées.
- Question AE / TI (uniquement si DCA NON) qui ajoute un 2e bloc à l'AFFAIRE WATT (codes PO REFUS 12/03/67).
- AFFAIRE WATT change selon STATUT : `PO REFUS 06` (A/C) ou `PO REFUS 65` (PL).
- TODO : sous-catégorie REFUS DCA MANQUANTES.

*Catégorie RÉEXÉCUTION* : 6 chemins codés (3 INSTRUCTIONS CJ × 2 FICOBA).
- DEFAUT / S ATT / COM × FICOBA OUI / FICOBA NON.
- Inputs : image (Ctrl+V), DATE DE PRESCRIPTION (expandée en JJ/MM/AAAA), ADRESSE (multi-ligne, forcée MAJUSCULES dans le résultat), CJ.
- Le formatage rich text reproduit le `.docx` (gras, italique, souligné, bullets imbriqués).

*Mécanismes du moteur* :
- Layout 2 colonnes (sidebar 400px + flex-1).
- Toggles imbriqués (stack), topQuestions, fragments, inputs conditionnels avec dédup, defaultInputs conditionné, conditions numériques.
- Type d'input `image` avec listener paste global, bouton ✕ pour suppr.
- LeafQuestions étendues à n choix via `choices: ["ae", "ti"]`.
- Auto-conversion `JJ/MM/AAAA → JJ/MM/AA` dans tous les résultats (sauf RÉEXÉCUTION).
- Bouton "📋 chemin" pour partager l'état du parcours avec Claude.
- Couleur rouge non préservée au copier-coller (limitation Word 2024).
- Bouton Copier rich text vers Word/Outlook (avec préservation des sauts de ligne, paragraphes, puces).
- Contexte global (COMPTE / STATUT) avec défaut "ACTIF" implicite.

**🎯 Court terme (priorité)**
- Sous-catégorie DÉLAI : `REFUS DCA MANQUANTES` (squelette sans suite).
- Compléter ANV / DÉLAI / RÉEXÉCUTION si nouveaux cas métier remontent.
- Gagner en vitesse : raccourcis clavier (touches numériques pour les choix, Esc pour retour) — à discuter.
- Refactoriser RÉEXÉCUTION : 6 chemins quasi-identiques avec ~450 lignes de duplication. Helper `makeReexCourrier({phrase3, phraseAReception, phraseSansReaction, mentionFicobaIndispo})` économiserait beaucoup.

**📅 Plus tard**
- Modes opératoires : "comment faire X" (procédures internes) — pas prioritaire.
- Peut-être un moteur de recherche si la liste de motifs devient longue.
- Refactoriser anvLeafConfig + anv12LeafConfig + anv16LeafConfig si plus de duplication apparaît.

**🧭 Pistes à envisager quand ce sera le moment**
- Faire en sorte que le contexte global (COMPTE/STATUT) **filtre** les choix affichés (ex : si COMPTE = RADIÉ, masquer les motifs qui ne s'appliquent qu'aux comptes actifs). Nécessite d'ajouter un champ `conditions` au schéma — à designer ensemble.
- Inliner Tailwind pour tout faire marcher sans aucun accès réseau
- Déployer via GitHub Pages avec un lien court en marque-page navigateur

## Commandes utiles

- **Lancer en local** : double-clic sur `index.html`, aucun serveur requis
- **Publier** : `git push` sur la branche `main` + activer GitHub Pages dans Settings → Pages
- **Debug console** (F12) :
  - `window.treeData` → inspecter l'arbre

---
*Bloqué sur une question métier sans réponse de ma part ? Mets `// TODO: à valider` au bon endroit et continue, on y reviendra.*

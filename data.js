// ============================================================================
// data.js
// Modèle ULTRA commenté pour créer votre arborescence métier.
// ============================================================================

// IMPORTANT :
// 1) Ce fichier est lu par index.html.
// 2) La variable DOIT s'appeler exactement treeData.
// 3) Respectez les virgules et les guillemets comme dans les exemples.

// Ces 2 groupes representent le contexte global.
// Ils ne changent PAS de page : ils sont affiches dans un bloc a droite de ANV.
// Leur valeur est enregistree pour etre reutilisee plus tard dans les textes.
const globalContextOptions = [
  {
    id: "compte",
    label: "COMPTE",
    choix: ["ACTIF", "RADIÉ"],
  },
  {
    id: "statut",
    label: "STATUT",
    choix: ["A/C", "PL"],
  },
];

// Configuration partagée par toutes les feuilles ANV.
// Gère les 2 formats de post-it selon STATUT :
// - A/C → POST-IT PORTAIL TI avec format "ANV [PARTIELLE] 11 SS MOTIF 01 PV DE CARENCE GED DU ..."
// - PL  → POST-IT ESDC avec format "ANV [PARTIELLE] 11: CARENCE-CONSTAT DU ... - PV DE CARENCE"
// Dans les 2 formats, si DRETAF=OUI → ligne DRETAF. Si SUSPEN=OUI (RADIÉ uniquement) → ligne SUSPEN.
// Si tout à NON → post-it réduit à 1 ligne, fusionné avec COMMENTAIRE AFFAIRE WATT.
// Variables templatées utilisées :
//   {{motif-prefix}}      = "ANV PARTIELLE" (si ACTIF) ou "ANV" (si RADIÉ)
//   {{motif-code}}        = "11" (extrait du label du motif)
//   {{sous-motif-code}}   = "01" (extrait du label du sous-motif)
//   {{sous-motif-abbrev}} = abréviation du sous-motif selon STATUT (abbrevAC ou abbrevPL)
//   {{date}}, {{co-number}}, {{dretaf}}, {{suspen}} = saisis par l'utilisateur
const anvLeafConfig = {
  leafQuestions: [
    {
      // DRETAF : toujours visible
      id: "dretaf",
      label: "DRETAF",
      inputsOnYes: [
        {
          id: "co-number",
          label: "N° CO",
          type: "text",
          placeholder: "",
        },
      ],
    },
    {
      // ANV SUSPEN : uniquement si COMPTE = RADIÉ
      id: "suspen",
      label: "ANV SUSPEN",
      conditions: { compte: ["RADIÉ"] },
    },
  ],
  resultats: [
    // ============================================================
    // STATUT A/C : POST-IT PORTAIL TI + COMMENTAIRE AFFAIRE WATT
    // ============================================================
    {
      id: "post-it-ti",
      label: "POST-IT PORTAIL TI",
      type: "multi",
      if: { statut: ["A/C"] },
      mergeWithCompositeIfSingle: "commentaire-watt-ac",
      mergedLabel: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "ged-ac",
          texte: "{{motif-prefix}} {{motif-code}} SS MOTIF {{sous-motif-code}} {{sous-motif-abbrev}} GED DU {{date}}",
        },
        {
          id: "dretaf-line-ac",
          if: { dretaf: ["oui"] },
          texte: "DRETAF CO {{co-number}} pour passer ANV",
        },
        {
          id: "suspen-line-ac",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-ac",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["A/C"] },
      combine: ["ged-ac", "suspen-line-ac", "dretaf-line-ac"],
      separator: "<br>+<br>",
    },
    // ============================================================
    // STATUT PL : POST-IT ESDC + COMMENTAIRE AFFAIRE WATT
    // ============================================================
    {
      id: "post-it-esdc",
      label: "POST-IT ESDC",
      type: "multi",
      if: { statut: ["PL"] },
      mergeWithCompositeIfSingle: "commentaire-watt-pl",
      mergedLabel: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "carence-pl",
          texte: "{{motif-prefix}}{{motif-code}}: CARENCE-CONSTAT DU {{date}} - {{sous-motif-abbrev}}",
        },
        {
          id: "dretaf-line-pl",
          if: { dretaf: ["oui"] },
          texte: "DRETAF CO {{co-number}} pour passer ANV",
        },
        {
          id: "suspen-line-pl",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-pl",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["PL"] },
      combine: ["carence-pl", "suspen-line-pl", "dretaf-line-pl"],
      separator: "<br>+<br>",
    },
  ],
};

// Configuration des feuilles pour le MOTIF 12 (PSA).
// Même logique que anvLeafConfig mais textes différents :
// - A/C → "ANV [PARTIELLE] 12 SS MOTIF [code] [abbrev] GED DU {date} ET RECH EOPPS + FICOBA RECENTE"
// - PL  → "ANV[PARTIELLE]12 : RECHERCHES NEGATIVES - CONSTAT DU {date} - [abbrev]"
//   (note : pas d'espace entre préfixe et code en PL, comme pour le motif 11)
const anv12LeafConfig = {
  leafQuestions: [
    {
      id: "dretaf",
      label: "DRETAF",
      inputsOnYes: [
        {
          id: "co-number",
          label: "N° CO",
          type: "text",
          placeholder: "",
        },
      ],
    },
    {
      id: "suspen",
      label: "ANV SUSPEN",
      conditions: { compte: ["RADIÉ"] },
    },
  ],
  resultats: [
    // A/C : POST-IT PORTAIL TI + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-ti-12",
      label: "POST-IT PORTAIL TI",
      type: "multi",
      if: { statut: ["A/C"] },
      mergeWithCompositeIfSingle: "commentaire-watt-ac-12",
      mergedLabel: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "ged-ac-12",
          texte: "{{motif-prefix}} {{motif-code}} SS MOTIF {{sous-motif-code}} {{sous-motif-abbrev}} GED DU {{date}} ET RECH EOPPS + FICOBA RECENTE",
        },
        {
          id: "dretaf-line-ac-12",
          if: { dretaf: ["oui"] },
          texte: "DRETAF CO {{co-number}} pour passer ANV",
        },
        {
          id: "suspen-line-ac-12",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-ac-12",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["A/C"] },
      combine: ["ged-ac-12", "suspen-line-ac-12", "dretaf-line-ac-12"],
      separator: "<br>+<br>",
      // FICOBA ajouté en suffixe avec un saut de ligne vide (pas de "+")
      appendFragments: ["ficoba-line-12"],
      appendSeparator: "<br><br>",
    },
    // PL : POST-IT ESDC + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-esdc-12",
      label: "POST-IT ESDC",
      type: "multi",
      if: { statut: ["PL"] },
      mergeWithCompositeIfSingle: "commentaire-watt-pl-12",
      mergedLabel: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "carence-pl-12",
          texte: "{{motif-prefix}}{{motif-code}} : RECHERCHES NEGATIVES - CONSTAT DU {{date}} - {{sous-motif-abbrev}}",
        },
        {
          id: "dretaf-line-pl-12",
          if: { dretaf: ["oui"] },
          texte: "DRETAF CO {{co-number}} pour passer ANV",
        },
        {
          id: "suspen-line-pl-12",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-pl-12",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["PL"] },
      combine: ["carence-pl-12", "suspen-line-pl-12", "dretaf-line-pl-12"],
      separator: "<br>+<br>",
      // FICOBA ajouté en suffixe avec un saut de ligne vide (pas de "+")
      appendFragments: ["ficoba-line-12"],
      appendSeparator: "<br><br>",
    },
    // Fragment partagé : "(Pas de FICOBA car site KO)" ajouté au composite WATT
    // (A/C ou PL) quand la topQuestion FICOBA est répondue NON.
    // Type "fragment" = juste un sub-bloc référencé par combine, pas un article visible.
    {
      id: "ficoba-line-12",
      type: "fragment",
      if: { ficoba: ["non"] },
      texte: "(Pas de FICOBA car site KO)",
    },
  ],
};

// ============================================================================
// Configurations pour les cas SPÉCIAUX (pas d'ANV) :
// - 3 cas avec versements récents (frais frustratoires / insolvable / PSA)
// - 1 cas rare (frustratoires sans versements)
// Tous produisent un seul bloc COMMENTAIRE AFFAIRE WATT.
// ============================================================================

// Helper interne : feuille pour un cas "VERSEMENTS RÉCENTS = OUI" + raison.
// L'input ÉCRITURES est défini au niveau parent (verse-oui.suite) pour qu'il
// apparaisse dès le clic sur OUI, sans attendre la sélection de la raison.
function makeVersementsLeaf(phraseFin) {
  return {
    resultats: [
      {
        id: "watt-versements",
        label: "COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        texte:
          "Compte {{compte-display}} - Pas de risque de prescription - Plusieurs versements récents :<br>" +
          "{{ecritures}}<br><br>" +
          phraseFin,
      },
    ],
  };
}

// Input ÉCRITURES (textarea avec nettoyage auto au paste).
// Réutilisé au niveau verse-oui pour qu'il apparaisse dès la sélection OUI.
const ecrituresInput = {
  id: "ecritures",
  label: "ÉCRITURES",
  type: "textarea",
  transform: "ecritures-compte",
  placeholder: "Coller les écritures du compte (Ctrl+V) — sera nettoyé automatiquement",
};

// Helper interne : feuille pour le cas FRAIS FRUSTRATOIRES sans versements.
// Pas de textarea, tout sur une ligne (ni "plusieurs versements récents",
// ni double saut avant la phrase finale — collé dans le préambule).
function makeFrustrSansVersementsLeaf() {
  return {
    resultats: [
      {
        id: "watt-frustr-sans-versements",
        label: "COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        texte:
          "Compte {{compte-display}} - Pas de risque de prescription - Pas de réexécution car frais frustratoires, en attente d'autres contraintes pour faire une réexécution groupée - Pas d'ANV car aucun justificatif - Tentative de recouvrement à l'amiable -> RELDET + formulaire de demande délai envoyé par SCRIBE",
      },
    ],
  };
}

// ============================================================================
// Configurations pour le MOTIF 13 (DCD - Décédé), 2 sous-motifs : 1ÈRE ENQUÊTE
// et RELANCE. Chaque sous-motif a ses propres résultats selon STATUT (A/C / PL).
//
// 1ÈRE ENQUÊTE :
//   - POST-IT : "RECHERCHE HÉRITIERS : 1ÈRE ENQUÊTE" (TI ET ESDC en A/C, ESDC en PL)
//   - WATT : 4 lignes rattachements + bloc ANV avec ARRET MOTIF 25 (A/C) ou OPP DCD DEBUT (PL)
//
// RELANCE :
//   - POST-IT : 2 blocs copiables (RECHERCHE HÉRITIERS + ANV ... GED DU {today})
//   - WATT : 4 lignes rattachements + bloc ANV combiné
//   - {{today}} = date du jour au format JJ/MM/AA, auto-générée
// ============================================================================

const RATTACHEMENTS_HERITIERS_HTML =
  "CCA rattaché à l'affaire<br>" +
  "Succession vacantes rattaché à l'affaire<br>" +
  "Mail au chambre des notaires rattaché à l'affaire<br>" +
  "Courrier aux héritiers envoyé par voie postale";

const anv13_1ereEnqueteLeaf = {
  resultats: [
    // POST-IT (A/C : portail TI ET ESDC)
    {
      id: "post-it-13-1ere-ac",
      label: "POST-IT PORTAIL TI ET ESDC",
      type: "simple",
      if: { statut: ["A/C"] },
      texte: "RECHERCHE HÉRITIERS : 1ÈRE ENQUÊTE",
    },
    // POST-IT (PL : ESDC seulement)
    {
      id: "post-it-13-1ere-pl",
      label: "POST-IT ESDC",
      type: "simple",
      if: { statut: ["PL"] },
      texte: "RECHERCHE HÉRITIERS : 1ÈRE ENQUÊTE",
    },
    // COMMENTAIRE WATT (A/C) : 2 sub-blocs copiables
    {
      id: "watt-13-1ere-ac",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "multi",
      if: { statut: ["A/C"] },
      blocs: [
        { id: "ratt-1ere-ac", texte: RATTACHEMENTS_HERITIERS_HTML },
        {
          id: "anv-1ere-ac",
          texte:
            "ANV 13 DCD SUSPEN au {{date}} -&gt; RECHERCHE HÉRITIERS : 1ÈRE ENQUÊTE<br>+<br>ARRET MOTIF 25",
        },
      ],
    },
    // COMMENTAIRE WATT (PL)
    {
      id: "watt-13-1ere-pl",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "multi",
      if: { statut: ["PL"] },
      blocs: [
        { id: "ratt-1ere-pl", texte: RATTACHEMENTS_HERITIERS_HTML },
        {
          id: "anv-1ere-pl",
          texte:
            "ANV 13 DCD SUSPEN au {{date}} -&gt; RECHERCHE HÉRITIERS : 1ÈRE ENQUÊTE<br>+<br>OPP DCD DEBUT",
        },
      ],
    },
  ],
};

const anv13_relanceLeaf = {
  resultats: [
    // POST-IT TI ET ESDC (A/C) : 2 sub-blocs copiables
    {
      id: "post-it-13-relance-ac",
      label: "POST-IT PORTAIL TI ET ESDC",
      type: "multi",
      if: { statut: ["A/C"] },
      blocs: [
        { id: "her-rel-ac", texte: "RECHERCHE HÉRITIERS : RELANCE" },
        {
          id: "anv-rel-ac-ti",
          texte: "ANV 13 SS MOTIF 19 ENQ PAS ACTIF GED DU {{today}}",
        },
      ],
    },
    // POST-IT ESDC (PL) : 2 sub-blocs
    {
      id: "post-it-13-relance-pl",
      label: "POST-IT ESDC",
      type: "multi",
      if: { statut: ["PL"] },
      blocs: [
        { id: "her-rel-pl", texte: "RECHERCHE HÉRITIERS : RELANCE" },
        {
          id: "anv-rel-pl-esdc",
          texte:
            "ANV13 : DCD - CONSTAT DU {{today}} - PAS D'HÉRITIERS &amp; ACTIF CONNU",
        },
      ],
    },
    // COMMENTAIRE WATT (A/C)
    {
      id: "watt-13-relance-ac",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "multi",
      if: { statut: ["A/C"] },
      blocs: [
        { id: "ratt-rel-ac", texte: RATTACHEMENTS_HERITIERS_HTML },
        {
          id: "anv-rel-ac-watt",
          texte:
            "ANV 13 SS MOTIF 19 ENQ PAS ACTIF GED DU {{today}}<br>+<br>RECHERCHE HÉRITIERS : RELANCE",
        },
      ],
    },
    // COMMENTAIRE WATT (PL)
    {
      id: "watt-13-relance-pl",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "multi",
      if: { statut: ["PL"] },
      blocs: [
        { id: "ratt-rel-pl", texte: RATTACHEMENTS_HERITIERS_HTML },
        {
          id: "anv-rel-pl-watt",
          texte:
            "ANV13 : DCD - CONSTAT DU {{today}} - PAS D'HÉRITIERS &amp; ACTIF CONNU<br>+<br>RECHERCHE HÉRITIERS : RELANCE",
        },
      ],
    },
  ],
};

// ============================================================================
// Configuration des feuilles pour le MOTIF 16 (CRÉANCE < SEUIL 201€).
// Même structure que motif 11/12 : leafQuestions DRETAF + ANV SUSPEN, et un
// POST-IT + COMMENTAIRE WATT (fusion auto si DRETAF=non et SUSPEN=non).
// - A/C → "ANV [PARTIELLE] 16 SS MOTIF 32 - CONSTAT DU {date}"
// - PL  → "ANV[PARTIELLE]16 : CREANCE < AU SEUIL - CONSTAT DU {date}"
// ============================================================================
const anv16LeafConfig = {
  leafQuestions: [
    {
      id: "dretaf",
      label: "DRETAF",
      inputsOnYes: [
        {
          id: "co-number",
          label: "N° CO",
          type: "text",
          placeholder: "",
        },
      ],
    },
    {
      id: "suspen",
      label: "ANV SUSPEN",
      conditions: { compte: ["RADIÉ"] },
    },
  ],
  resultats: [
    // A/C : POST-IT PORTAIL TI + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-ti-16",
      label: "POST-IT PORTAIL TI",
      type: "multi",
      if: { statut: ["A/C"] },
      mergeWithCompositeIfSingle: "commentaire-watt-ac-16",
      mergedLabel: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "ged-ac-16",
          texte: "{{motif-prefix}} {{motif-code}} SS MOTIF 32 - CONSTAT DU {{date}}",
        },
        {
          id: "dretaf-line-ac-16",
          if: { dretaf: ["oui"] },
          texte: "DRETAF CO {{co-number}} pour passer ANV",
        },
        {
          id: "suspen-line-ac-16",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-ac-16",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["A/C"] },
      combine: ["ged-ac-16", "suspen-line-ac-16", "dretaf-line-ac-16"],
      separator: "<br>+<br>",
    },
    // PL : POST-IT ESDC + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-esdc-16",
      label: "POST-IT ESDC",
      type: "multi",
      if: { statut: ["PL"] },
      mergeWithCompositeIfSingle: "commentaire-watt-pl-16",
      mergedLabel: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "carence-pl-16",
          texte: "{{motif-prefix}}{{motif-code}} : CREANCE &lt; AU SEUIL - CONSTAT DU {{date}}",
        },
        {
          id: "dretaf-line-pl-16",
          if: { dretaf: ["oui"] },
          texte: "DRETAF CO {{co-number}} pour passer ANV",
        },
        {
          id: "suspen-line-pl-16",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-pl-16",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["PL"] },
      combine: ["carence-pl-16", "suspen-line-pl-16", "dretaf-line-pl-16"],
      separator: "<br>+<br>",
    },
  ],
};

// Cette constante contient toute la branche ANV (une catégorie).
const anvBranch = {
  // id: identifiant interne (sans espace, unique si possible)
  id: "anv",

  // label: texte visible sur la carte/bouton
  label: "ANV",

  // description: sous-texte visible (facultatif mais recommande)
  description: "",

  // suite: ce qui se passe APRES le clic.
  // ANV = parcours classique direct vers MOTIF/SOUS-MOTIF (sans niveau intermédiaire).
  suite: {
    question: "ANV",
    inputs: [
      // DATE générique : visible toujours, sauf override par un autre input "date" ci-dessous.
      {
        id: "date",
        label: "DATE",
        type: "text",
        placeholder: "",
      },
      // Override pour motif 14 + PL : DATE devient "DATE DE PARUTION JUGEMENT BODACC".
      // (Même id "date" → même variable {{date}}, juste le label change.)
      // inline: true → cet input et le suivant (date-liq) sont regroupés sur une seule rangée.
      {
        id: "date",
        label: "DATE DE PARUTION JUGEMENT BODACC",
        type: "text",
        placeholder: "",
        inline: true,
        conditions: { statut: ["PL"], "motif-id": ["motif-14-liquidation-judiciaire-cia"] },
      },
      // Input additionnel pour motif 14 + PL uniquement (sur la même rangée que la date BODACC).
      {
        id: "date-liq",
        label: "DATE PR LIQ CL IN",
        type: "text",
        placeholder: "",
        inline: true,
        conditions: { statut: ["PL"], "motif-id": ["motif-14-liquidation-judiciaire-cia"] },
      },
    ],
    choicesTitle: "MOTIF",
    choix: [
      {
        id: "motif-11-insolvabilite",
        label: "11 - INSOLVABILITÉ",
        description: "",
        suite: {
          question: "ANV",
          choicesTitle: "SOUS-MOTIF",
          choix: [
            {
              id: "sous-motif-01-pv-carence",
              label: "01 - PV DE CARENCE",
              description: "",
              abbrevAC: "PV DE CARENCE",
              abbrevPL: "PV DE CARENCE",
              suite: anvLeafConfig,
            },
            {
              id: "sous-motif-02-s-att-negative",
              label: "02 - S ATT NÉGATIVE",
              description: "",
              abbrevAC: "S ATT NEGATIVE",
              abbrevPL: "S ATT NEGATIVE",
              suite: anvLeafConfig,
            },
            {
              id: "sous-motif-06-certificat-irrecouvrabilite",
              label: "06 - CERTIFICAT D’IRRÉCOUVRABILITÉ",
              description: "",
              abbrevAC: "COU HJ NEGATIVE",
              abbrevPL: "CERTIF IRRECOUV.",
              suite: anvLeafConfig,
            },
            {
              id: "sous-motif-11-ficoba-negatif",
              label: "11 - FICOBA NÉGATIF",
              description: "",
              abbrevAC: "FICOBA NEGATIF",
              abbrevPL: "FICOBA NEGATIF",
              suite: anvLeafConfig,
            },
          ],
        },
      },
      {
        id: "motif-12-psa",
        label: "12 - PSA",
        description: "",
        suite: {
          question: "ANV",
          // Question optionnelle : si FICOBA = NON, le bloc principal devient
          // "ET RECH EOPPS RECENTE" (sans "+ FICOBA") et on ajoute un bloc
          // "(Pas de FICOBA car site KO)" à la fin du COMMENTAIRE WATT.
          topQuestions: [
            {
              id: "ficoba",
              label: "FICOBA DISPONIBLE ?",
            },
          ],
          choicesTitle: "SOUS-MOTIF",
          choix: [
            // Sous-motifs visibles uniquement en A/C (avec code)
            {
              id: "sous-motif-12-20-pv-659",
              label: "20 - PV 659",
              description: "",
              conditions: { statut: ["A/C"] },
              abbrevAC: "PV 659 CPC",
              abbrevPL: "PV 659 CPC",
              suite: anv12LeafConfig,
            },
            {
              id: "sous-motif-12-25-enq-psa",
              label: "25 - ENQ PSA/ETRANG",
              description: "",
              conditions: { statut: ["A/C"] },
              abbrevAC: "ENQ PSA/ETRANG",
              abbrevPL: "ENQ PSA/ETRANG",
              suite: anv12LeafConfig,
            },
            // Sous-motifs visibles uniquement en PL (sans code)
            {
              id: "sous-motif-12-pl-pv-659",
              label: "PV 659",
              description: "",
              conditions: { statut: ["PL"] },
              abbrevAC: "ART 659 CPC",
              abbrevPL: "ART 659 CPC",
              suite: anv12LeafConfig,
            },
            {
              id: "sous-motif-12-pl-md-psa",
              label: "MD PSA",
              description: "",
              conditions: { statut: ["PL"] },
              abbrevAC: "MD PSA",
              abbrevPL: "MD PSA",
              suite: anv12LeafConfig,
            },
          ],
        },
      },
      {
        id: "motif-13-decede",
        label: "13 - DÉCÉDÉ",
        description: "",
        // Pré-remplit DATE avec la date du jour quand on clique sur 13
        // (uniquement si DATE est vide — ne touche pas une saisie manuelle).
        defaultInputs: { date: "today" },
        suite: {
          question: "ANV",
          choicesTitle: "SOUS-MOTIF",
          choix: [
            {
              id: "sous-motif-13-1ere-enquete",
              label: "1ÈRE ENQUÊTE",
              description: "",
              suite: anv13_1ereEnqueteLeaf,
            },
            {
              id: "sous-motif-13-relance",
              label: "RELANCE",
              description: "",
              suite: anv13_relanceLeaf,
            },
          ],
        },
      },
      {
        id: "motif-14-liquidation-judiciaire-cia",
        label: "14 - LIQUIDATION JUDICIAIRE (CIA)",
        description: "",
        // En A/C : pré-remplit DATE avec la date du jour (comme motif 13).
        // En PL : on n'applique PAS l'auto-remplissage (les 2 dates BODACC + LIQ CL IN
        // sont à saisir manuellement par l'utilisateur).
        defaultInputs: { date: "today" },
        defaultInputsConditions: { statut: ["A/C"] },
        suite: {
          resultats: [
            // PL : POST-IT ESDC & WATT (un seul bloc combiné)
            {
              id: "result-14-pl",
              label: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
              type: "simple",
              if: { statut: ["PL"] },
              texte: "ANV14 : CIA DU {{date-liq}} AVIS JUGEMENT BODACC DU {{date}}",
            },
            // A/C : POST-IT PORTAIL TI & WATT (un seul bloc combiné)
            {
              id: "result-14-ac",
              label: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
              type: "simple",
              if: { statut: ["A/C"] },
              texte: "ANV 14 SS MOTIF 28 CIA JUGEMENT GED DU {{date}}",
            },
          ],
        },
      },
      {
        id: "motif-16-creance-seuil",
        label: "16 - CRÉANCE < SEUIL 201€",
        description: "",
        // Auto-remplit DATE avec la date du jour quand on clique sur 16 (comme motif 13).
        defaultInputs: { date: "today" },
        suite: anv16LeafConfig,
      },
    ],
  },
};

// ============================================================================
// AMIABLE RELDET : sous-choix dans le niveau MOTIF de ANV (premier de la liste).
// Structure simplifiée en 2 niveaux :
//   1. VERSEMENT RÉCENT (oui/non)
//   2. RAISON (frais frustr. / insolvable / PSA)
// Pas de niveau RÉEXÉCUTION : c'est toujours "sans réexécution" dans ce flux.
// Si VERSEMENT = OUI → textarea ÉCRITURES sur la feuille.
// ============================================================================

// Sous-niveau RAISON quand VERSEMENT = OUI : 3 raisons → feuille avec textarea
// ÉCRITURES + COMMENTAIRE WATT.
const raisonChoixAvecVersements = [
  {
    id: "raison-frustratoires",
    label: "FRAIS FRUSTRATOIRES",
    description: "",
    suite: makeVersementsLeaf(
      "Pas de réexécution car frais frustratoires, en attente d'autres contraintes pour faire une réexécution groupée - Pas d'ANV car aucun justificatif et versements récents - Tentative de recouvrement à l'amiable -> RELDET + formulaire de demande délai envoyé par SCRIBE"
    ),
  },
  {
    id: "raison-insolvable",
    label: "INSOLVABLE",
    description: "",
    suite: makeVersementsLeaf(
      "Pas de réexécution car retour pour motif insolvable - Pas d'ANV suite aux versements récents - Tentative de recouvrement à l'amiable -> RELDET + formulaire de demande délai envoyé par SCRIBE"
    ),
  },
  {
    id: "raison-psa",
    label: "PSA",
    description: "",
    suite: makeVersementsLeaf(
      "Pas de réexécution car retour pour motif PSA et pas de nouvelle adresse trouvée - Pas d'ANV suite aux versements récents - Tentative de recouvrement à l'amiable -> RELDET + formulaire de demande délai envoyé par SCRIBE"
    ),
  },
];

// Sous-niveau RAISON quand VERSEMENT = NON : seul FRAIS FRUSTRATOIRES est
// applicable dans ce cas (les autres raisons impliquent des versements).
const raisonChoixSansVersements = [
  {
    id: "raison-frustratoires",
    label: "FRAIS FRUSTRATOIRES",
    description: "",
    suite: makeFrustrSansVersementsLeaf(),
  },
];

// AMIABLE RELDET = toggle indépendant au-dessus du parcours ANV.
// Quand DÉSACTIVÉ (défaut) : parcours normal DATE + MOTIF.
// Quand ACTIVÉ : on entre dans la sous-cascade VERSEMENT RÉCENT > RAISON.
// Implémenté via le champ "toggles" sur anvBranch.suite (cf moteur dans index.html).
const amiableReldetToggle = {
  id: "amiable-reldet",
  label: "AMIABLE RELDET",
  whenOn: {
    choicesTitle: "VERSEMENT RÉCENT",
    choix: [
      {
        id: "verse-oui",
        label: "OUI",
        description: "",
        suite: {
          // Le textarea ÉCRITURES apparaît dès la sélection OUI,
          // pour que l'utilisateur puisse coller pendant qu'il choisit la raison.
          inputs: [ecrituresInput],
          choicesTitle: "RAISON",
          choix: raisonChoixAvecVersements,
        },
      },
      {
        id: "verse-non",
        label: "NON",
        description: "",
        suite: {
          choicesTitle: "RAISON",
          choix: raisonChoixSansVersements,
        },
      },
    ],
  },
};

anvBranch.suite.toggles = [amiableReldetToggle];

// ============================================================================
// DETTE NON EXIGIBLE = toggle imbriqué dans AMIABLE RELDET.
// Quand activé, remplace VERSEMENT RÉCENT par un choix CO / MD PSA.
// - CO → 3 raisons (FRAIS FRUSTRATOIRES / INSOLVABLE / PSA) → résultat WATT
// - MD PSA → résultat WATT direct (pas de raison à choisir)
// Tous les résultats finissent par "Pas d'ANV car dette non exigible - …"
// ============================================================================

function makeDetteNonExigibleLeaf(phraseMiddle) {
  return {
    resultats: [
      {
        id: "watt-dette-non-exigible",
        label: "COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        texte:
          "Compte {{compte-display}} - Pas de risque de prescription - " +
          phraseMiddle +
          " - Pas d'ANV car dette non exigible - Tentative de recouvrement à l'amiable -> RELDET + formulaire de demande délai envoyé par SCRIBE",
      },
    ],
  };
}

const detteNonExigibleToggle = {
  id: "dette-non-exigible",
  label: "DETTE NON EXIGIBLE",
  whenOn: {
    choicesTitle: "TYPE",
    choix: [
      {
        id: "type-co",
        label: "CO",
        suite: {
          choicesTitle: "RAISON",
          choix: [
            {
              id: "raison-co-frustratoires",
              label: "FRAIS FRUSTRATOIRES",
              suite: makeDetteNonExigibleLeaf(
                "Pas de réexécution car frais frustratoires, en attente d'autres contraintes pour faire une réexécution groupée"
              ),
            },
            {
              id: "raison-co-insolvable",
              label: "INSOLVABLE",
              suite: makeDetteNonExigibleLeaf(
                "Pas de réexécution car retour pour motif insolvable"
              ),
            },
            {
              id: "raison-co-psa",
              label: "PSA",
              suite: makeDetteNonExigibleLeaf(
                "Pas de réexécution car retour pour motif PSA et pas de nouvelle adresse trouvée"
              ),
            },
          ],
        },
      },
      {
        id: "type-md-psa",
        label: "MD PSA",
        // Pas de choix supplémentaire : résultat direct
        suite: makeDetteNonExigibleLeaf(
          "MD PSA et pas de nouvelle adresse trouvée"
        ),
      },
    ],
  },
};

// On rend le toggle DETTE NON EXIGIBLE disponible quand AMIABLE RELDET est activé.
amiableReldetToggle.whenOn.toggles = [detteNonExigibleToggle];

// Question optionnelle "COMPTE EN LIGNE OU MAIL ?" affichée dans la rangée des toggles,
// entre AMIABLE RELDET et DETTE NON EXIGIBLE. Par défaut non répondue (= comportement
// "OUI implicite"). Si l'utilisateur répond NON, le moteur remplace globalement
// "-> RELDET + formulaire de demande délai envoyé par SCRIBE" par
// "-> RELDET fait en v2 car pas de compte en ligne ni de mail pour envoyer par SCRIBE".
amiableReldetToggle.whenOn.topQuestions = [
  {
    id: "compte-en-ligne",
    label: "COMPTE EN LIGNE OU MAIL ?",
  },
];

// ============================================================================
// Branche DÉLAI : pour les demandes d'échéancier.
// Sous-catégorie principale : "REFUS - PAS DE PJ" qui demande à l'utilisateur :
//   1. DCA / DR À JOUR ? (oui/non)  → leafQuestion
//   2. MOIS (nombre)                → input visible si DCA = OUI
//   3. + DE 50 000€ ? (oui/non)     → leafQuestion visible si DCA = OUI
// Les résultats (OBJET / TEXTE COURRIER / AFFAIRE WATT) varient selon MOIS :
//   - MOIS ≤ 36 → version "compte tenu du montant"
//   - MOIS > 36 → version "ne peut pas excéder 36 mois"
// ============================================================================

const delaiRefusPasPjLeafConfig = {
  inputs: [
    {
      id: "mois",
      label: "MOIS",
      type: "text",
      placeholder: "Ex: 26",
      // Visible dès qu'on entre dans REFUS - PAS DE PJ.
    },
  ],
  leafQuestions: [
    {
      id: "dca",
      label: "DCA / DR À JOUR ?",
    },
    {
      id: "plus50k",
      label: "+ DE 50 000€ ?",
    },
    {
      id: "ae-ti",
      label: "AE OU TI ?",
      // Apparaît uniquement quand DCA = NON
      conditions: { dca: ["non"] },
      choices: ["ae", "ti"],
    },
  ],
  resultats: [
    // ===== OBJET (commun à TOUS les cas avec DCA et 50K répondus) =====
    {
      id: "delai-objet",
      label: "OBJET",
      type: "simple",
      if: { dca: ["oui", "non"], plus50k: ["oui", "non"] },
      texte: "demande d'échéancier sur {{mois}} mois",
    },

    // ===== TEXTE DU COURRIER : MOIS > 36 (identique pour 50K=OUI et 50K=NON) =====
    {
      id: "delai-courrier-gt36",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui", "non"], "mois-gt-36": ["oui"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.<br><br>" +
        "Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : MOIS ≤ 36 + 50K = OUI (version "compte tenu du montant") =====
    // S'affiche par défaut (même si MOIS vide) car "mois-gt-36" vaut "non" tant
    // que MOIS n'est pas > 36.
    {
      id: "delai-courrier-le36-50k-oui",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Compte tenu du montant de votre dette, l'étude de votre dossier nécessite la transmission, <strong>sous quinze jours</strong>, de tous les éléments ou justificatifs permettant de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : MOIS ≤ 36 + 50K = NON (version courte "afin d'étudier") =====
    {
      id: "delai-courrier-le36-50k-non",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["non"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Afin d'étudier votre dossier, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== AFFAIRE WATT : commun à 50K=OUI et 50K=NON =====
    // En A/C → "PO REFUS 06" / en PL → "PO REFUS 65" (juste le code change)
    {
      id: "delai-watt-ac",
      label: "AFFAIRE WATT",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui", "non"], statut: ["A/C"] },
      texte:
        "SUR PO REFUS 06 en raison de l'absence de justificatifs concernant la demande de délai avec une dette supérieur à 50 000€. Une demande de pièces complémentaires a été transmise via SCRIBE.",
    },
    {
      id: "delai-watt-pl",
      label: "AFFAIRE WATT",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui", "non"], statut: ["PL"] },
      texte:
        "SUR PO REFUS 65 en raison de l'absence de justificatifs concernant la demande de délai avec une dette supérieur à 50 000€. Une demande de pièces complémentaires a été transmise via SCRIBE.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS ≤ 36 + 50K = OUI =====
    // Version "Compte tenu du montant de votre dette" avec le bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-le36-50k-oui",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["oui"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Compte tenu du montant de votre dette, l'étude de votre dossier nécessite la transmission, <strong>sous quinze jours</strong>, de tous les éléments ou justificatifs permettant de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS > 36 + 50K = OUI =====
    // "ne peut pas excéder 36 mois" + "Pour nous permettre d'étudier... 36 échéances"
    // + bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-gt36-50k-oui",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["oui"], "mois-gt-36": ["oui"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.<br><br>" +
        "Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS ≤ 36 + 50K = NON =====
    // Version "Afin d'étudier votre dossier" + bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-le36-50k-non",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["non"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Afin d'étudier votre dossier, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS > 36 + 50K = NON =====
    // Version "ne peut pas excéder 36 mois" + "Pour nous permettre d'étudier..."
    // + bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-gt36-50k-non",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["non"], "mois-gt-36": ["oui"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.<br><br>" +
        "Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== AFFAIRE WATT : DCA = NON + MOIS ≤ 36 + 50K = OUI =====
    // Composite avec 3 sections : bloc1 (PO REFUS dette > 50k) + bloc2 (PO REFUS DCA/déclarations)
    // séparés par "+", puis conclusion en suffixe avec saut de ligne.
    // Les fragments ci-dessous gèrent les variantes A/C / PL et AE / TI.
    {
      id: "watt-dca-non-bloc1-ac",
      type: "fragment",
      if: { dca: ["non"], plus50k: ["oui", "non"], statut: ["A/C"] },
      texte: "SUR PO REFUS 06 en raison de l'absence de justificatifs concernant la demande de délai avec une dette supérieur à 50 000€.",
    },
    {
      id: "watt-dca-non-bloc1-pl",
      type: "fragment",
      if: { dca: ["non"], plus50k: ["oui", "non"], statut: ["PL"] },
      texte: "SUR PO REFUS 65 en raison de l'absence de justificatifs concernant la demande de délai avec une dette supérieur à 50 000€.",
    },
    {
      id: "watt-dca-non-bloc2-ae-ac",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ae"], statut: ["A/C"] },
      texte: "SUR PO REFUS 12 car DCA manquantes.",
    },
    {
      id: "watt-dca-non-bloc2-ae-pl",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ae"], statut: ["PL"] },
      texte: "SUR PO REFUS 67 car DCA manquantes.",
    },
    {
      id: "watt-dca-non-bloc2-ti-ac",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ti"], statut: ["A/C"] },
      texte: "SUR PO REFUS 03 car déclarations de revenus manquantes.",
    },
    {
      id: "watt-dca-non-bloc2-ti-pl",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ti"], statut: ["PL"] },
      texte: "SUR PO REFUS 67 car déclarations de revenus manquantes.",
    },
    {
      id: "watt-dca-non-conclusion-ae",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ae"] },
      texte: "Une demande de pièces complémentaires a été transmise via SCRIBE avec un rappel concernant ses DCA manquantes.",
    },
    {
      id: "watt-dca-non-conclusion-ti",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ti"] },
      texte: "Une demande de pièces complémentaires a été transmise via SCRIBE avec un rappel concernant ses déclarations de revenus.",
    },
    {
      id: "delai-watt-dca-non",
      label: "AFFAIRE WATT",
      type: "composite",
      // S'applique à DCA=NON quels que soient MOIS et 50K (toujours la même structure).
      if: { dca: ["non"], plus50k: ["oui", "non"], "ae-ti": ["ae", "ti"] },
      // Tous les fragments sont référencés ; seuls ceux dont les conditions matchent
      // seront effectivement présents dans subBlocsById et donc concaténés.
      combine: [
        "watt-dca-non-bloc1-ac",
        "watt-dca-non-bloc1-pl",
        "watt-dca-non-bloc2-ae-ac",
        "watt-dca-non-bloc2-ae-pl",
        "watt-dca-non-bloc2-ti-ac",
        "watt-dca-non-bloc2-ti-pl",
      ],
      separator: "<br>+<br>",
      appendFragments: [
        "watt-dca-non-conclusion-ae",
        "watt-dca-non-conclusion-ti",
      ],
      appendSeparator: "<br><br>",
    },

    // Tous les cas DCA=OUI/NON + MOIS≤36/>36 + 50K=OUI/NON sont couverts ci-dessus.
    // Reste TODO : sous-catégorie "REFUS DCA MANQUANTES" et la branche DCA=OUI sans
    // 50K répondu (peu probable comme cas réel).
  ],
};

// Cette constante contient toute la branche DÉLAI.
const delaiBranch = {
  id: "delai",
  label: "DÉLAI",
  description: "",
  suite: {
    question: "DÉLAI",
    // Plus d'input DATE au niveau racine DÉLAI (inutile pour le moment).
    choicesTitle: "SOUS-CATÉGORIE",
    choix: [
      {
        id: "sous-cat-refus-pas-pj",
        label: "REFUS - PAS DE PJ",
        description: "",
        suite: delaiRefusPasPjLeafConfig,
      },
      // TODO: à coder — sous-catégorie "REFUS DCA MANQUANTES" (squelette laissé pour plus tard)
      {
        id: "sous-cat-refus-dca-manquantes",
        label: "REFUS DCA MANQUANTES",
        description: "",
      },
    ],
  },
};

// ============================================================================
// Branche RÉEXÉCUTION : transmission de titres exécutoires à un CJ.
// L'utilisateur fournit :
//   - une capture d'écran (collée via Ctrl+V dans une zone dédiée)
//   - une date de prescription
//   - une adresse (peut être multi-ligne)
//   - un numéro de CJ
//   - une réponse à FICOBA DISPONIBLE ? (oui/non)
//   - un choix INSTRUCTIONS CJ (défaut / s att / com)
// Pour l'instant, seul le chemin DEFAUT + FICOBA = OUI est codé. Les autres sont TODO.
// ============================================================================

const reexecutionBranch = {
  id: "reexecution",
  label: "RÉEXÉCUTION",
  description: "",
  suite: {
    question: "RÉEXÉCUTION",
    inputs: [
      {
        id: "image-cj",
        label: "IMAGE",
        type: "image",
        placeholder: "Cliquer ici puis coller la capture (Ctrl+V)",
      },
      {
        id: "date-prescription",
        label: "DATE DE PRESCRIPTION",
        type: "text",
        placeholder: "JJ/MM/AAAA",
      },
      {
        id: "adresse",
        label: "ADRESSE",
        type: "textarea",
        placeholder: "Adresse du débiteur",
      },
      {
        id: "cj-numero",
        label: "CJ",
        type: "text",
        placeholder: "Numéro CJ",
      },
    ],
    leafQuestions: [
      {
        id: "ficoba-reex",
        label: "FICOBA DISPONIBLE ?",
      },
      {
        id: "instructions-cj",
        label: "INSTRUCTIONS CJ",
        choices: ["defaut", "s att", "com"],
      },
    ],
    resultats: [
      // ===== Chemin DEFAUT + FICOBA = OUI =====
      {
        id: "reex-courrier-defaut-ficoba-oui",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["defaut"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure<br>- Ficoba</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-defaut-ficoba-oui",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["defaut"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin DEFAUT + FICOBA = NON =====
      // Identique au cas FICOBA OUI, sauf :
      //   - "- Ficoba" retiré de la liste des pièces jointes
      //   - paragraphe ajouté : "Nous n'avons pas de FICOBA à vous proposer..."
      {
        id: "reex-courrier-defaut-ficoba-non",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["defaut"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure</p>" +
          "<p>Nous n’avons pas de FICOBA à vous proposer pour le moment, le site étant indisponible. Merci de formuler une nouvelle requête ultérieurement si vous souhaitez l’obtenir.</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-defaut-ficoba-non",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["defaut"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin S ATT + FICOBA = OUI =====
      // Identique à DEFAUT + FICOBA = OUI sauf la phrase "Sans réaction de sa part…"
      // qui devient "…procéder à une saisie-attribution".
      {
        id: "reex-courrier-satt-ficoba-oui",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["s att"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à procéder à une saisie-attribution.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure<br>- Ficoba</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-satt-ficoba-oui",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["s att"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin S ATT + FICOBA = NON =====
      // Identique à DEFAUT + FICOBA = NON sauf la même phrase saisie-attribution.
      {
        id: "reex-courrier-satt-ficoba-non",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["s att"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à procéder à une saisie-attribution.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure</p>" +
          "<p>Nous n’avons pas de FICOBA à vous proposer pour le moment, le site étant indisponible. Merci de formuler une nouvelle requête ultérieurement si vous souhaitez l’obtenir.</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-satt-ficoba-non",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["s att"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin COM + FICOBA = OUI =====
      // Le 3e paragraphe change ("commandement de payer afin d'interrompre la prescription")
      // et les 2 paragraphes "A réception…" + "Sans réaction de sa part…" sont supprimés.
      {
        id: "reex-courrier-com-ficoba-oui",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["com"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à un commandement de payer afin d'interrompre la prescription.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure<br>- Ficoba</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-com-ficoba-oui",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["com"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin COM + FICOBA = NON =====
      // Idem COM + FICOBA OUI mais sans "- Ficoba" dans les pièces jointes
      // et avec le paragraphe "Nous n'avons pas de FICOBA…" inséré.
      {
        id: "reex-courrier-com-ficoba-non",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["com"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à un commandement de payer afin d'interrompre la prescription.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure</p>" +
          "<p>Nous n’avons pas de FICOBA à vous proposer pour le moment, le site étant indisponible. Merci de formuler une nouvelle requête ultérieurement si vous souhaitez l’obtenir.</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-com-ficoba-non",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["com"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },
    ],
  },
};

// treeData = racine de l'arbre. Liste toutes les catégories disponibles.
// Pour ajouter une catégorie future (ex: REEXECUTION) :
// 1) créer une nouvelle constante (comme anvBranch / delaiBranch)
// 2) l'ajouter dans le tableau choix ci-dessous.
const treeData = {
  question: "",
  choix: [anvBranch, delaiBranch, reexecutionBranch],
};

// ============================================================================
// GUIDE RAPIDE POUR MODIFIER SANS CASSER LE CODE
// ============================================================================

// 1) Où mettre les virgules ?
// - ENTRE les propriétés d'un objet:
//   { id: "x", label: "Mon choix", description: "...", suite: { ... } }
// - ENTRE les objets d'un tableau:
//   choix: [ { ... }, { ... }, { ... } ]
// - PAS de virgule obligatoire après le tout dernier élément,
//   mais ici on les laisse souvent pour faciliter les duplications.

// 2) Où mettre les guillemets ?
// - Les textes sont entre guillemets doubles "...".
// - Si votre texte contient déjà des guillemets, utilisez \" à l'intérieur.
//   Exemple: "Il a dit \"bonjour\""
// - Pour les apostrophes (') en français, rien de spécial.

// 3) Comment dupliquer un choix proprement ?
// - Copiez un bloc complet entre { et }.
// - Collez-le juste après un autre bloc au même niveau.
// - Vérifiez qu'il y a une virgule entre les deux blocs.
// - Changez au minimum: id, label, description, et le contenu de suite.

// 4) Comment créer de la profondeur (jusqu'à 8 niveaux) ?
// - Répétez ce schéma autant de fois que nécessaire :
//   suite: {
//     question: "...",
//     choix: [
//       {
//         id: "...",
//         label: "...",
//         description: "...",
//         suite: { ... }
//       }
//     ]
//   }

// 5) Comment terminer un chemin ?
// - À la fin, remplacez la prochaine question par:
//   suite: {
//     resultats: [
//       { label: "...", texte: "..." },
//       { label: "...", texte: "..." },
//       { label: "...", texte: "..." }
//     ]
//   }

// Rend la variable disponible globalement pour index.html.
window.globalContextOptions = globalContextOptions;
window.treeData = treeData;

#!/usr/bin/env node
// Linter français léger pour data.js.
//
// Cherche les fautes les plus probables dans tous les "texte: ..." :
//  - Préposition + participe passé là où on attend un infinitif (ex: "pour envoyé")
//  - Noms féminins courants suivis d'un adjectif masculin (ex: "dette supérieur")
//  - Espaces doubles
//
// Usage : node scripts/lint-fr.js
// Sortie : liste de lignes suspectes avec n° de ligne. Aucune modif du fichier.
// Code de sortie 0 si rien trouvé, 1 sinon — pratique pour un pre-commit hook plus tard.

const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data.js");
const source = fs.readFileSync(DATA_PATH, "utf8");
const lines = source.split(/\r?\n/);

// Noms féminins fréquents dans le projet — si suivis d'un adjectif masculin
// (qui se termine sans -e), c'est probablement une faute d'accord.
const FEMININ_NOUNS = [
  "dette", "demande", "lettre", "créance", "affaire", "somme", "raison",
  "réexécution", "exécution", "prescription", "réception", "tentative",
  "pièce", "adresse", "date", "écriture",
];

// Adjectifs masculins courants qui ont une forme féminine attendue (avec -e final).
const MASC_ADJECTIVES_NEEDING_E = [
  "supérieur", "inférieur", "égal", "exigible", // exigible est invariable, on saute
  "manquant", "récent", "complet", "frustratoire", "groupé",
];

// Prépositions après lesquelles on attend généralement un infinitif (et donc PAS un
// participe passé en -é, sauf cas particuliers).
const PREPOSITIONS = ["pour", "sans"];

// Verbes courants pour lesquels participe passé / infinitif sont homophones
// et où "pour <verbe>é" est presque toujours une faute (sauf "envoyé" nom).
const COMMON_VERBS_PP = [
  "envoyé", "payé", "signé", "recouvré", "reçu", "transmis", "renvoyé",
  "annulé", "validé", "rejeté", "préparé", "noté", "saisi",
];

const findings = []; // { line, col, kind, snippet, suggestion }

function pushFinding(lineIdx, col, kind, snippet, suggestion) {
  findings.push({ line: lineIdx + 1, col: col + 1, kind, snippet, suggestion });
}

// On utilise des lookarounds Unicode-aware (\p{L}) plutôt que \b qui se
// comporte mal autour des accents en JS (ex: \bgroupé\b matche dans "groupée"
// parce que \b voit une frontière entre 'é' et 'e' qui n'en est pas une).
const NOT_LETTER_BEFORE = "(?<!\\p{L})";
const NOT_LETTER_AFTER = "(?!\\p{L})";

// Règle 1 : préposition + participe passé (probable infinitif manquant).
const prepoVerbRegex = new RegExp(
  `${NOT_LETTER_BEFORE}(${PREPOSITIONS.join("|")})\\s+(${COMMON_VERBS_PP.join("|")})${NOT_LETTER_AFTER}`,
  "giu"
);

// Règle 2 : nom féminin + adjectif masculin (qui devrait être en -e).
const fnMascRegex = new RegExp(
  `${NOT_LETTER_BEFORE}(${FEMININ_NOUNS.join("|")})s?\\s+(${MASC_ADJECTIVES_NEEDING_E.join("|")})${NOT_LETTER_AFTER}`,
  "giu"
);

// Règle 3 : double espace dans une chaîne (souvent indésirable dans un courrier).
const doubleSpaceRegex = /  +/g;

lines.forEach((line, idx) => {
  // On ne traite que les lignes qui contiennent une chaîne texte (très large)
  // mais on saute les commentaires // pour éviter le bruit.
  const trimmed = line.trim();
  if (trimmed.startsWith("//")) return;

  let m;
  while ((m = prepoVerbRegex.exec(line)) !== null) {
    pushFinding(idx, m.index, "prep-pp", m[0], `${m[1]} <infinitif>`);
  }
  prepoVerbRegex.lastIndex = 0;

  while ((m = fnMascRegex.exec(line)) !== null) {
    pushFinding(idx, m.index, "accord-fem", m[0], `${m[1]} ${m[2]}e`);
  }
  fnMascRegex.lastIndex = 0;

  // Double espace uniquement dans les chaînes — on ne se restreint pas finement,
  // mais on évite l'indentation en début de ligne.
  const noIndent = line.replace(/^\s+/, "");
  if (doubleSpaceRegex.test(noIndent)) {
    pushFinding(idx, line.indexOf(noIndent), "double-space", noIndent.match(/.{0,80}/)[0], "<un seul espace>");
  }
  doubleSpaceRegex.lastIndex = 0;
});

// Sortie
if (findings.length === 0) {
  console.log("OK — aucune faute potentielle trouvée dans data.js.");
  process.exit(0);
}

console.log(`${findings.length} occurrence(s) potentielle(s) trouvée(s) :\n`);
const grouped = findings.reduce((acc, f) => {
  (acc[f.kind] = acc[f.kind] || []).push(f);
  return acc;
}, {});

const LABELS = {
  "prep-pp": "Préposition + participe passé (infinitif probablement attendu)",
  "accord-fem": "Nom féminin + adjectif masculin (accord à vérifier)",
  "double-space": "Double espace",
};

for (const [kind, items] of Object.entries(grouped)) {
  console.log(`--- ${LABELS[kind] || kind} (${items.length}) ---`);
  for (const f of items) {
    console.log(`  data.js:${f.line}  "${f.snippet}"  -> proposition : "${f.suggestion}"`);
  }
  console.log("");
}

console.log("Note : ce sont des SIGNALEMENTS, pas des erreurs certaines.");
console.log("À toi de juger au cas par cas — certains peuvent être faux positifs.");
process.exit(1);

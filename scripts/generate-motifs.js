#!/usr/bin/env node
// Génère MOTIFS.md à partir de data.js : un dump human-readable de toute
// l'arborescence (catégories → motifs → sous-motifs → résultats), utile pour :
//  - Toi : retrouver d'un coup d'œil ce qui existe déjà
//  - Claude futur : repérer les duplications, factoriser, ajouter des motifs
//
// Usage : node scripts/generate-motifs.js  (regénère MOTIFS.md à la racine)
//
// Le script est déterministe : sortie identique pour une même data.js, donc
// pas de churn dans les commits si tu n'as rien changé.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const DATA_PATH = path.join(ROOT, "data.js");
const OUT_PATH = path.join(ROOT, "MOTIFS.md");

// On évalue data.js dans un sandbox avec un fake "window".
const code = fs.readFileSync(DATA_PATH, "utf8");
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const { treeData, globalContextOptions } = sandbox.window;
if (!treeData) {
  console.error("ERREUR: window.treeData non exposé par data.js.");
  process.exit(2);
}

const lines = [];
const push = (s = "") => lines.push(s);

push("# MOTIFS.md — dump auto-généré de l'arborescence");
push("");
push("> ⚠️ Fichier régénéré par `node scripts/generate-motifs.js`. Ne pas éditer à la main.");
push("");

// --- Contexte global ---
push("## Contexte global");
push("");
(globalContextOptions || []).forEach((opt) => {
  push(`- **${opt.label}** (\`${opt.id}\`) : ${(opt.choix || []).join(" / ")}`);
});
push("");

// --- Helpers ---
function condStr(c) {
  if (!c || Object.keys(c).length === 0) return "";
  const parts = Object.entries(c).map(([k, v]) => {
    if (Array.isArray(v)) return `${k}=${v.join("|")}`;
    if (v && typeof v === "object") {
      return `${k} ${Object.entries(v).map(([op, n]) => `${op} ${n}`).join(" et ")}`;
    }
    return `${k}=${v}`;
  });
  return ` *[si ${parts.join(", ")}]*`;
}

function clipText(t, max = 200) {
  const s = String(t || "").replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return s.slice(0, max) + " …";
}

function renderResultats(resultats, depth) {
  const indent = "  ".repeat(depth);
  resultats.forEach((r) => {
    const ifStr = condStr(r.if);
    const head = r.type ? `[${r.type}]` : "[simple]";
    push(`${indent}- ${head} \`${r.id}\` — **${r.label || ""}**${ifStr}`);
    if (r.type === "composite") {
      push(`${indent}  - combine: ${(r.combine || []).join(" + ")}`);
      if (r.appendFragments) push(`${indent}  - appendFragments: ${r.appendFragments.join(", ")}`);
    } else if (r.type === "multi") {
      (r.blocs || []).forEach((b) => {
        push(`${indent}  - bloc \`${b.id}\`${condStr(b.if)} : « ${clipText(b.texte)} »`);
      });
    } else if (r.type === "fragment") {
      push(`${indent}  - fragment : « ${clipText(r.texte)} »`);
    } else {
      // simple ou défaut
      push(`${indent}  - « ${clipText(r.texte)} »`);
    }
  });
}

function renderInputs(inputs, depth) {
  if (!inputs || inputs.length === 0) return;
  const indent = "  ".repeat(depth);
  push(`${indent}- *inputs* : ${inputs.map((i) => `${i.id}(${i.type || "text"})${condStr(i.conditions)}`).join(", ")}`);
}

function renderToggles(toggles, depth) {
  if (!toggles || toggles.length === 0) return;
  const indent = "  ".repeat(depth);
  push(`${indent}- *toggles* :`);
  toggles.forEach((t) => {
    push(`${indent}  - ☑ **${t.label}** (\`${t.id}\`)`);
    if (t.whenOn) renderNode(t.whenOn, depth + 2);
  });
}

function renderTopQuestions(qs, depth) {
  if (!qs || qs.length === 0) return;
  const indent = "  ".repeat(depth);
  push(`${indent}- *topQuestions* : ${qs.map((q) => `${q.label} (\`${q.id}\`)`).join(", ")}`);
}

function renderNode(node, depth) {
  if (!node) return;
  renderInputs(node.inputs, depth);
  if (node.choicesTitle) {
    const indent = "  ".repeat(depth);
    push(`${indent}- *${node.choicesTitle}* :`);
    (node.choix || []).forEach((c) => {
      const indent2 = "  ".repeat(depth + 1);
      push(`${indent2}- \`${c.id}\` — **${c.label || ""}**${condStr(c.conditions)}`);
      if (c.suite) {
        if (c.suite.resultats) {
          renderResultats(c.suite.resultats, depth + 2);
        } else {
          renderNode(c.suite, depth + 2);
        }
      }
    });
  }
  renderToggles(node.toggles, depth);
  renderTopQuestions(node.topQuestions, depth);
  if (node.resultats) {
    renderResultats(node.resultats, depth);
  }
}

// --- Arbre principal ---
push("## Arbre");
push("");
push(`*Racine* : ${treeData.choicesTitle || "(sans titre)"}`);
push("");
(treeData.choix || []).forEach((cat) => {
  push(`### ${cat.label} (\`${cat.id}\`)`);
  push("");
  if (cat.suite) {
    if (cat.suite.resultats) {
      renderResultats(cat.suite.resultats, 0);
    } else {
      renderNode(cat.suite, 0);
    }
  }
  push("");
});

// --- Stats ---
function countNodes(node, stats) {
  if (!node) return;
  if (node.inputs) stats.inputs += node.inputs.length;
  if (node.toggles) {
    stats.toggles += node.toggles.length;
    node.toggles.forEach((t) => countNodes(t.whenOn, stats));
  }
  if (node.topQuestions) stats.topQuestions += node.topQuestions.length;
  if (node.choix) {
    stats.choix += node.choix.length;
    node.choix.forEach((c) => {
      if (c.suite) {
        if (c.suite.resultats) {
          stats.resultats += c.suite.resultats.length;
        } else {
          countNodes(c.suite, stats);
        }
      }
    });
  }
  if (node.resultats) stats.resultats += node.resultats.length;
}

const stats = { choix: 0, inputs: 0, toggles: 0, topQuestions: 0, resultats: 0 };
(treeData.choix || []).forEach((cat) => {
  stats.choix++;
  if (cat.suite) countNodes(cat.suite, stats);
});

push("## Stats");
push("");
push(`- Catégories : ${treeData.choix?.length || 0}`);
push(`- Choix totaux (tous niveaux) : ${stats.choix}`);
push(`- Inputs : ${stats.inputs}`);
push(`- Toggles : ${stats.toggles}`);
push(`- TopQuestions : ${stats.topQuestions}`);
push(`- Résultats (blocs texte) : ${stats.resultats}`);
push("");

fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");
console.log(`OK — ${OUT_PATH} regénéré (${lines.length} lignes).`);

# PROMPTS.md — Séquence audit + refonte pour Claude Code

**Comment utiliser ce fichier** : lance `claude` dans ton dossier de projet, puis copie-colle les prompts **dans l'ordre**. Ne passe pas au suivant tant que tu n'as pas validé le précédent. Entre chaque prompt, tu peux continuer dans la même conversation ou faire `/clear` selon la longueur.

> Claude lit `CLAUDE.md` automatiquement au démarrage. Tous les prompts ci-dessous s'appuient dessus — pas besoin de répéter le contexte.

---

## Prompt 1 — Audit honnête et exhaustif

> Passe en **Plan Mode** avant de lancer ce prompt : `Shift+Tab` deux fois.

```
Tu as lu CLAUDE.md. Lis maintenant data.js et index.html en entier.

Fais-moi un audit COMPLET du projet à la lumière de mon contexte réel
(contrôleur recouvrement, outil perso, étoile polaire = moins de clics / plus de vitesse,
repo public GitHub sans donnée confidentielle).

Pour chaque fichier, donne-moi :

1. CE QUI EST BIEN FAIT — honnête, pas de flatterie. Si rien n'est bien, dis-le.

2. CE QUI EST OBJECTIVEMENT AMÉLIORABLE, classé par criticité :
   - BLOQUANT : bugs, failles de sécurité, données confidentielles qui traîneraient,
     choses qui ne marchent pas ou risquent de casser
   - IMPORTANT : dette technique qui va coûter cher dès que j'enrichirai l'arbre,
     mauvaises pratiques, risques pour la confidentialité (repo public)
   - COSMÉTIQUE : lisibilité, propreté, organisation

3. VITESSE ET NOMBRE DE CLICS — passe tous les parcours utilisateur types au crible
   de l'étoile polaire. Où est-ce que je perds du temps inutilement ? Quels clics
   pourraient être économisés ?

4. CE QUE JE N'AI PAS PENSÉ À FAIRE : fonctionnalités manquantes évidentes,
   UX, accessibilité clavier (crucial pour la vitesse), edge cases non gérés,
   cas d'usage métier non couverts.

Ne code RIEN pour l'instant. Juste l'audit, structuré et priorisé.

ultrathink
```

---

## Prompt 2 — Clarifier avant de décider

```
Avant de me proposer un plan, pose-moi les questions dont tu as besoin pour calibrer
la refonte à mon usage réel. CLAUDE.md a déjà le contexte général — concentre-toi
sur ce qu'il ne dit pas :

- Combien de dossiers je traite par jour en moyenne ? Par semaine ?
- Quels motifs / sous-motifs je touche LE PLUS souvent ? (on optimisera ces chemins)
- Qu'est-ce qui me fait perdre le plus de temps dans ma méthode actuelle (sans outil) ?
- Y a-t-il d'autres types de courriers que je fais hors ANV que je devrais
  anticiper dans l'arborescence ?
- Quelle version de navigateur j'ai au bureau ? Des restrictions connues (pas de
  copier-coller, pas de localStorage, policies strictes) ?
- Est-ce que je travaille au clavier principalement, à la souris, ou les deux ?
- Quel est mon budget temps pour cette phase : petits patches, week-end complet,
  chantier sur un mois ?

Pose 5 à 8 questions max. Attends mes réponses.
```

---

## Prompt 3 — Plans alternatifs alignés sur la roadmap

```
Sur la base de mes réponses et de la roadmap dans CLAUDE.md, propose-moi 3 plans
alternatifs :

PLAN A — Stabiliser
Corrige uniquement les bloquants de l'audit + 2-3 gains de vitesse faciles.
Objectif : rendre l'outil robuste pour un usage quotidien dès maintenant.
Ne touche pas à la structure, ne change pas d'approche.

PLAN B — Compléter et accélérer
Enrichit l'arbre (court terme de la roadmap : motifs complets, textes de courriers)
ET ajoute les gains de vitesse majeurs (raccourcis clavier, optimisation des
chemins fréquents). Refacto ciblée uniquement si elle débloque ces gains.

PLAN C — Préparer l'avenir
Refonte structurelle pour préparer le filtrage par contexte global (COMPTE/STATUT)
et les modes opératoires. Peut impliquer de repenser le schéma de data.js.
Plus ambitieux, plus long, mais prépare tout ce qui est dans les sections
"Plus tard" et "Pistes à envisager" du CLAUDE.md.

Pour chaque plan :
- Ce qui CHANGE concrètement (fichiers touchés, fonctionnalités ajoutées)
- Ce qui NE CHANGE PAS (promesse de non-régression sur l'existant)
- Le risque de casser un comportement actuel (1-5)
- Le temps estimé pour moi si je suis guidé étape par étape
- Les gains concrets : combien de clics ou de secondes économisés par dossier ?

Recommande-moi UN plan et explique pourquoi dans MON cas spécifique
(fréquence d'usage, contraintes corpo, niveau technique, budget temps).

ultrathink
```

---

## Prompt 4 — Exécution pas à pas

> À lancer après avoir choisi un plan. Reste en Plan Mode pour valider chaque étape avant exécution.

```
Go pour le plan [A / B / C].

On avance étape par étape, JAMAIS plus d'une modif à la fois :

1. Présente-moi la 1ère étape : quel problème elle résout, quels fichiers elle
   touche, le diff exact en avant/après.
2. J'approuve → tu l'appliques.
3. Tu me listes précisément ce que je dois tester dans le navigateur
   (F12 ouvert, onglet Console) : parcours précis à cliquer, comportement
   attendu, warnings à surveiller, bouton Copier à tester dans Word.
4. Je confirme que tout va bien → on commit avec un message clair → étape suivante.
5. Si ça casse, on revient en arrière avec `git reset --hard HEAD~1` et on retente
   différemment.

Termine CHAQUE étape par le mini-bilan en 3 points demandé dans CLAUDE.md :
- ✅ Ce qui a été fait
- 🧪 Ce que je dois tester
- 💡 1 à 3 pistes à creuser ensuite (jugées à l'aune "moins de clics / plus de vitesse")

Ne me propose jamais 3 modifs d'un coup. Une à la fois.
```

---

## Prompt 5 — Ce que tu n'imagines pas (la pépite)

> À lancer une fois le refacto bien avancé. Fais `/clear` avant, pour repartir sur un contexte frais.

```
Relis CLAUDE.md, data.js, index.html en entier.

En tant que dev senior qui découvrirait mon projet ET mon contexte de contrôleur
recouvrement, liste-moi 10 idées d'améliorations que je n'ai probablement pas
imaginées.

Couvre ces angles :
- MÉTIER : idées basées sur le domaine recouvrement / ANV / courriers aux usagers
  auxquelles un non-dev du métier n'aurait pas pensé
- VITESSE : raccourcis clavier, prédiction du chemin le plus probable, mémorisation
  du dernier parcours, saisie de texte en une frappe...
- CONFIDENTIALITÉ : risques sur le repo public, fuite possible de données via
  l'historique Git, localStorage partagé en cas de session Windows commune...
- ACCESSIBILITÉ DANS UN CONTEXTE CORPORATE : navigateur potentiellement vieux,
  policies strictes, impression de courriers, compatibilité avec Outlook/Word...
- FILTRAGE CONTEXTUEL : comment le COMPTE/STATUT pourrait réduire le nombre de
  motifs affichés et donc les clics

Pour chaque idée :
- Le PROBLÈME que ça résout (réel ou risque futur)
- La VALEUR concrète en vitesse / clics / sécurité
- L'EFFORT : S (< 1h) / M (< 1 jour) / L (> 1 jour)
- Pourquoi ça peut aussi être une MAUVAISE idée (contre-argument honnête)

Classe par ratio VALEUR / EFFORT décroissant.

Pas de généralités type "ajoute des tests / de la doc / du TypeScript".
Du SPÉCIFIQUE à MON projet ANV, MON métier, MON contexte corpo.

ultrathink
```

---

## Prompt bonus — Mode "challenge-moi"

> À garder sous la main pour quand tu hésites sur une décision.

```
Voilà ce que je veux faire : [ton idée].

Joue l'avocat du diable avant que je commence :
- Quelles hypothèses je fais sans m'en rendre compte ?
- Qu'est-ce qui peut mal se passer à 3 mois, à 1 an ?
- Y a-t-il une approche plus simple que je rate ?
- Quelle est la version "50% de l'effort, 80% du résultat" ?
- Est-ce que je résous le bon problème ou je soigne un symptôme ?
- Est-ce que ça respecte l'étoile polaire "moins de clics" ou ça ajoute de la friction ?

Pose-moi des questions avant de répondre si tu manques de contexte.
```

---

## Règles du jeu pour toi

- **Lis les réponses de Claude avant d'approuver.** Si un truc te paraît bizarre, demande-lui de l'expliquer en français simple avant d'appliquer.
- **Commit avant chaque étape importante.** `git add . && git commit -m "avant étape X"`. Filet de sécurité pour revenir en arrière sans stress.
- **Quand un terme technique te bloque, demande.** Exemple : *"c'est quoi un 'event listener' ? explique comme à un débutant avec un exemple tiré de mon code"*.
- **Si Claude part dans tous les sens, recentre-le.** *"Tu vas trop loin, on fait seulement l'étape qu'on a validée."*
- **Teste dans le navigateur après chaque modif.** Ouvre `index.html`, clique partout, F12 → Console : pas d'erreur rouge = bon signe. Vérifie toujours le bouton Copier en collant dans Word.
- **Avant de push sur GitHub**, vérifie toujours qu'aucune vraie donnée client ne s'est glissée dans les exemples : `git diff` avant chaque commit.

const APP_VERSION = "9.0.0";
const catalog = {
  "caip-quiz-complet-1": "data/caip/quiz-complet-1.json",
  "caip-quiz-complet-2": "data/caip/quiz-complet-2.json",
  "spark-general": "data/spark/questions.json"
};

// Compatibilité avec les anciens liens partagés.
// CAIP contient désormais plusieurs quiz : l’ancien lien ?quiz=caip
// affiche donc la liste des quiz au lieu de lancer directement un quiz.
const quizAliases = {
  spark: "spark-general"
};

const formations = {
  caip: {
    kicker: "Intelligence artificielle",
    title: "Professionnel certifié en intelligence artificielle (CAIP) — PECB",
    description: "Deux quiz complets de 40 questions pour réviser l'ensemble des domaines couverts par la formation CAIP.",
    className: "caip",
    image: "assets/images/formations/caip.png",
    imageAlt: "Illustration Intelligence artificielle",
    quizzes: [
      {
        id: "caip-quiz-complet-1",
        kicker: "Quiz complet 1 • 40 questions",
        title: "CAIP — Évaluation complète 1",
        description: "Fondamentaux de l'IA, données, machine learning, NLP, deep learning, IA générative, vision, robotique, sécurité, éthique et gouvernance."
      },
      {
        id: "caip-quiz-complet-2",
        kicker: "Quiz complet 2 • 40 questions",
        title: "CAIP — Évaluation complète 2",
        description: "Deuxième série complète et complémentaire couvrant les mêmes grands domaines de compétence du programme CAIP."
      }
    ]
  },
  spark: {
    kicker: "Big Data",
    title: "Apache Spark : Programmer avec Apache Spark — Databricks",
    description: "Évaluez vos compétences sur Apache Spark, ses concepts clés et le développement d'applications distribuées.",
    className: "spark",
    image: "assets/images/formations/spark.png",
    imageAlt: "Illustration Apache Spark",
    quizzes: [
      {
        id: "spark-general",
        kicker: "Quiz Apache Spark",
        title: "Programmer avec Apache Spark",
        description: "Architecture Spark, DataFrames, transformations, actions, partitions et traitement distribué."
      }
    ]
  }
};

const state = {
  quiz: null,
  current: 0,
  score: 0,
  participant: "Participant",
  email: "",
  completedAt: null,
  answers: [],
  locked: false
};

const $ = (id) => document.getElementById(id);
const screens = [$("home-screen"), $("quiz-screen"), $("result-screen")];

function showScreen(id) {
  screens.forEach(s => s.classList.toggle("hidden", s.id !== id));
}

function params() {
  return new URLSearchParams(window.location.search);
}

function selectedQuizId() {
  const requested = params().get("quiz");
  return quizAliases[requested] || requested;
}

function selectedFormationId() {
  return params().get("formation");
}

async function init() {
  console.info(`Quizora ${APP_VERSION} chargé`);
  $("current-year").textContent = new Date().getFullYear();

  const requestedQuiz = params().get("quiz");
  const quizId = selectedQuizId();
  const formationId = selectedFormationId();

  // Ancien lien CAIP : comme la formation contient maintenant plusieurs quiz,
  // on affiche la liste de ses quiz.
  if (requestedQuiz === "caip") {
    showQuizPicker("caip");
    return;
  }

  if (quizId && catalog[quizId]) {
    await loadQuiz(quizId);
    return;
  }

  if (formationId && formations[formationId]) {
    showQuizPicker(formationId);
    return;
  }

  showFormationPicker();
}

async function loadQuiz(quizId) {
  try {
    const response = await fetch(catalog[quizId], { cache: "no-store" });
    if (!response.ok) throw new Error("Impossible de charger la banque de questions.");
    state.quiz = await response.json();

    $("formation-picker").classList.add("hidden");
    $("formation-title").textContent = state.quiz.title;
    $("formation-description").textContent = `${state.quiz.description} • ${state.quiz.questions.length} questions`;
    $("selected-training-summary").textContent = `Quiz sélectionné : ${state.quiz.title}`;
    $("participant-form").classList.remove("hidden");
    $("privacy-note").classList.add("hidden");
    $("load-error").classList.add("hidden");
  } catch (error) {
    $("formation-title").textContent = "Erreur de chargement";
    $("load-error").textContent = "Lancez l'application depuis un serveur web (voir README.md). Détail : " + error.message;
    $("load-error").classList.remove("hidden");
  }
}

function showFormationPicker() {
  $("formation-title").textContent = "Choisissez une formation";
  $("formation-description").textContent = "Sélectionnez une formation pour accéder à ses quiz et à ses banques de questions.";
  $("participant-form").classList.add("hidden");

  const picker = $("formation-picker");
  picker.innerHTML = Object.entries(formations).map(([id, meta]) => `
    <a class="training-card ${meta.className}" href="?formation=${id}">
      <span class="training-icon">
        <img class="training-image" src="${escapeHtml(meta.image)}?v=4" alt="${escapeHtml(meta.imageAlt || meta.title)}" loading="eager">
      </span>
      <span class="training-content">
        <span class="training-kicker">${escapeHtml(meta.kicker)}</span>
        <h2 class="training-title">${escapeHtml(meta.title)}</h2>
        <span class="training-description">${escapeHtml(meta.description)}</span>
        <span class="quiz-count">${meta.quizzes.length} ${meta.quizzes.length > 1 ? "quiz disponibles" : "quiz disponible"}</span>
      </span>
      <span class="training-arrow" aria-hidden="true">→</span>
    </a>
  `).join("");
  picker.classList.remove("hidden");
  $("privacy-note").classList.remove("hidden");
}

function showQuizPicker(formationId) {
  const formation = formations[formationId];
  $("formation-title").textContent = formation.title;
  $("formation-description").textContent = `${formation.quizzes.length} quiz disponibles — choisissez celui que vous souhaitez lancer.`;
  $("participant-form").classList.add("hidden");

  const picker = $("formation-picker");
  picker.innerHTML = `
    <a class="back-link" href="${window.location.pathname}">← Toutes les formations</a>
    ${formation.quizzes.map((quiz, index) => `
      <a class="quiz-choice-card ${formation.className}" href="?quiz=${encodeURIComponent(quiz.id)}">
        <span class="quiz-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="training-content">
          <span class="training-kicker">${escapeHtml(quiz.kicker)}</span>
          <h2 class="training-title">${escapeHtml(quiz.title)}</h2>
          <span class="training-description">${escapeHtml(quiz.description)}</span>
        </span>
        <span class="training-arrow" aria-hidden="true">→</span>
      </a>
    `).join("")}
  `;
  picker.classList.remove("hidden");
  $("privacy-note").classList.remove("hidden");
}

function startQuiz() {
  if (!state.quiz) return;

  const nameInput = $("participant-name");
  const emailInput = $("participant-email");
  const error = $("participant-error");
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  error.classList.add("hidden");
  error.textContent = "";

  if (!name) {
    error.textContent = "Veuillez saisir votre nom ou identifiant.";
    error.classList.remove("hidden");
    nameInput.focus();
    return;
  }

  if (!email || !emailInput.checkValidity()) {
    error.textContent = "Veuillez saisir une adresse e-mail valide.";
    error.classList.remove("hidden");
    emailInput.focus();
    return;
  }

  state.participant = name;
  state.email = email;
  state.current = 0;
  state.score = 0;
  state.answers = [];
  state.completedAt = null;
  state.locked = false;
  showScreen("quiz-screen");
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestion() {
  state.locked = false;
  $("next-btn").classList.add("hidden");
  const q = state.quiz.questions[state.current];
  $("progress-text").textContent = `Question ${state.current + 1} / ${state.quiz.questions.length}`;
  $("answer-progress").textContent = `Réponses enregistrées : ${state.answers.length} / ${state.quiz.questions.length}`;
  $("progress-bar").style.width = `${(state.current / state.quiz.questions.length) * 100}%`;
  $("question-category").textContent = q.category || "Question";
  $("question-text").textContent = q.question;

  const answers = $("answers");
  answers.innerHTML = "";
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => chooseAnswer(index));
    answers.appendChild(btn);
  });
}

function chooseAnswer(index) {
  if (state.locked) return;
  state.locked = true;

  const q = state.quiz.questions[state.current];
  const correct = index === q.correctIndex;
  if (correct) state.score++;
  state.answers.push({ questionId: q.id, chosenIndex: index, correct });

  // Pendant le quiz, aucune indication ne révèle si la réponse est correcte.
  // La réponse choisie est seulement mise en évidence de façon neutre.
  document.querySelectorAll(".answer-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === index) btn.classList.add("selected");
  });

  $("answer-progress").textContent = `Réponses enregistrées : ${state.answers.length} / ${state.quiz.questions.length}`;
  $("next-btn").textContent = state.current === state.quiz.questions.length - 1 ? "Terminer le quiz" : "Question suivante";
  $("next-btn").classList.remove("hidden");
}

function nextQuestion() {
  if (state.current < state.quiz.questions.length - 1) {
    state.current++;
    renderQuestion();
  } else {
    showResult();
  }
}

function categoryStats() {
  const stats = new Map();
  state.quiz.questions.forEach((q, i) => {
    const category = q.category || "Autre";
    if (!stats.has(category)) stats.set(category, { total: 0, correct: 0 });
    const item = stats.get(category);
    item.total += 1;
    if (state.answers[i]?.correct) item.correct += 1;
  });
  return [...stats.entries()].map(([category, values]) => ({
    category,
    total: values.total,
    correct: values.correct,
    percent: Math.round((values.correct / values.total) * 100)
  }));
}

function showResult() {
  showScreen("result-screen");
  state.completedAt = new Date();
  const total = state.quiz.questions.length;
  const percent = Math.round((state.score / total) * 100);
  $("participant-result").textContent = `${state.participant} — ${state.quiz.title}`;
  $("final-score").textContent = `${state.score} / ${total}`;
  $("final-message").textContent = `${percent}% de bonnes réponses. ${messageFor(percent)}`;
  $("result-meta").innerHTML = `
    <span><strong>Participant :</strong> ${escapeHtml(state.participant)}</span>
    <span><strong>E-mail :</strong> ${escapeHtml(state.email)}</span>
    <span><strong>Date :</strong> ${escapeHtml(formatDateTime(state.completedAt))}</span>
  `;

  $("theme-breakdown").innerHTML = `
    <h2>Résultats par thématique</h2>
    <div class="theme-grid">
      ${categoryStats().map(item => `
        <div class="theme-stat">
          <strong>${escapeHtml(item.category)}</strong>
          <span>${item.correct} / ${item.total} • ${item.percent}%</span>
        </div>
      `).join("")}
    </div>
  `;
  $("pdf-error").classList.add("hidden");

  const review = $("review");
  review.innerHTML = "<h2>Correction détaillée</h2>";
  state.quiz.questions.forEach((q, i) => {
    const a = state.answers[i];
    const div = document.createElement("div");
    div.className = "review-item";
    div.innerHTML = `
      <h3>${i + 1}. ${escapeHtml(q.question)}</h3>
      <p class="${a.correct ? "review-ok" : "review-ko"}">${a.correct ? "✓ Bonne réponse" : "✗ À revoir"}</p>
      <p><strong>Votre réponse :</strong> ${escapeHtml(q.options[a.chosenIndex])}</p>
      <p><strong>Réponse attendue :</strong> ${escapeHtml(q.options[q.correctIndex])}</p>
      <p><strong>Correction :</strong> ${escapeHtml(q.correction)}</p>`;
    review.appendChild(div);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(date);
}

function sanitizeFilename(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "participant";
}

function wrapPdfText(text, maxChars = 92) {
  const paragraphs = String(text).replace(/\r/g, "").split("\n");
  const lines = [];
  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
    } else {
      let line = "";
      words.forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length <= maxChars) {
          line = candidate;
        } else {
          if (line) lines.push(line);
          if (word.length > maxChars) {
            for (let i = 0; i < word.length; i += maxChars) lines.push(word.slice(i, i + maxChars));
            line = "";
          } else {
            line = word;
          }
        }
      });
      if (line) lines.push(line);
    }
    if (paragraphIndex < paragraphs.length - 1) lines.push("");
  });
  return lines;
}

function win1252Byte(char) {
  const code = char.codePointAt(0);
  if (code <= 0x7F || (code >= 0xA0 && code <= 0xFF)) return code;
  const map = {
    0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
    0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
    0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
    0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
    0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
    0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
    0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
  };
  return map[code] ?? 0x3F;
}

function pdfHex(text) {
  let hex = "";
  for (const char of String(text)) {
    hex += win1252Byte(char).toString(16).padStart(2, "0").toUpperCase();
  }
  return `<${hex}>`;
}

function makePdfDocument(pages) {
  const objects = [];
  const pageIds = pages.map((_, i) => 5 + i * 2);
  objects[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
  objects[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;

  pages.forEach((content, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  let pdf = "%PDF-1.4\n%Quizora\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id < objects.length; id++) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

function buildResultPdf() {
  const total = state.quiz.questions.length;
  const percent = Math.round((state.score / total) * 100);
  const completedAt = state.completedAt || new Date();
  const pages = [];
  let commands = [];
  let y = 790;
  const left = 48;
  const lineHeight = 12;

  function textLine(text, options = {}) {
    const { font = "F1", size = 9.5, indent = 0, gapAfter = 0 } = options;
    if (y < 55) newPage();
    commands.push(`BT /${font} ${size} Tf ${left + indent} ${y} Td ${pdfHex(text)} Tj ET`);
    y -= lineHeight;
    y -= gapAfter;
  }

  function wrapped(text, options = {}) {
    const { maxChars = 92, ...rest } = options;
    wrapPdfText(text, maxChars).forEach(line => textLine(line || " ", rest));
  }

  function newPage() {
    if (commands.length) pages.push(commands.join("\n"));
    commands = [];
    y = 790;
    commands.push(`BT /F2 9 Tf ${left} 815 Td ${pdfHex("Quizora - Rapport de résultats")} Tj ET`);
    commands.push(`BT /F1 8 Tf 440 815 Td ${pdfHex(`Page ${pages.length + 1}`)} Tj ET`);
  }

  newPage();
  textLine("QUIZORA", { font: "F2", size: 18, gapAfter: 4 });
  textLine("Rapport individuel de résultats", { font: "F2", size: 14, gapAfter: 10 });
  wrapped(`Formation / quiz : ${state.quiz.title}`, { font: "F2", size: 10.5, gapAfter: 3, maxChars: 82 });
  wrapped(`Participant : ${state.participant}`, { size: 10 });
  wrapped(`Adresse e-mail : ${state.email}`, { size: 10 });
  wrapped(`Date : ${formatDateTime(completedAt)}`, { size: 10, gapAfter: 5 });
  textLine(`Score final : ${state.score} / ${total} (${percent} %)`, { font: "F2", size: 13, gapAfter: 3 });
  wrapped(messageFor(percent), { size: 10, gapAfter: 8 });
  textLine("Résultats par thématique", { font: "F2", size: 12, gapAfter: 4 });
  categoryStats().forEach(item => {
    wrapped(`${item.category} : ${item.correct} / ${item.total} (${item.percent} %)`, { size: 9.2, indent: 8, maxChars: 86 });
  });
  y -= 5;
  textLine("Détail des réponses", { font: "F2", size: 13, gapAfter: 7 });

  state.quiz.questions.forEach((q, i) => {
    const answer = state.answers[i];
    if (y < 150) newPage();
    wrapped(`${i + 1}. ${q.question}`, { font: "F2", size: 10, maxChars: 84, gapAfter: 2 });
    textLine(answer.correct ? "Résultat : Bonne réponse" : "Résultat : À revoir", { font: "F2", size: 9.5 });
    wrapped(`Votre réponse : ${q.options[answer.chosenIndex]}`, { size: 9.2, indent: 10, maxChars: 88 });
    wrapped(`Réponse attendue : ${q.options[q.correctIndex]}`, { size: 9.2, indent: 10, maxChars: 88 });
    wrapped(`Correction : ${q.correction}`, { size: 9.2, indent: 10, maxChars: 88, gapAfter: 8 });
  });

  if (commands.length) pages.push(commands.join("\n"));
  return makePdfDocument(pages);
}

function downloadResultPdf() {
  const error = $("pdf-error");
  error.classList.add("hidden");
  error.textContent = "";

  try {
    if (!state.quiz || state.answers.length !== state.quiz.questions.length) {
      throw new Error("Le quiz doit être terminé avant de générer le rapport.");
    }

    const pdfBytes = buildResultPdf();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const quizName = sanitizeFilename(state.quiz.title);
    const participantName = sanitizeFilename(state.participant);
    const date = (state.completedAt || new Date()).toISOString().slice(0, 10);
    link.href = url;
    link.download = `quizora-${quizName}-${participantName}-${date}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (err) {
    console.error(err);
    error.textContent = `Impossible de générer le PDF : ${err.message}`;
    error.classList.remove("hidden");
  }
}

function messageFor(percent) {
  if (percent >= 80) return "Très bonne maîtrise des notions abordées.";
  if (percent >= 60) return "Bon niveau, avec quelques points à consolider.";
  return "Plusieurs notions méritent une révision avant de poursuivre.";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("start-btn").addEventListener("click", startQuiz);
$("participant-name").addEventListener("keydown", e => { if (e.key === "Enter") $("participant-email").focus(); });
$("participant-email").addEventListener("keydown", e => { if (e.key === "Enter") startQuiz(); });
$("next-btn").addEventListener("click", nextQuestion);
$("restart-btn").addEventListener("click", startQuiz);
$("pdf-btn").addEventListener("click", downloadResultPdf);
$("home-btn").addEventListener("click", () => { window.location.href = window.location.pathname; });

init();

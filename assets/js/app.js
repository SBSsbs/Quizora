const catalog = {
  caip: "data/caip/questions.json",
  spark: "data/spark/questions.json"
};

const state = {
  quiz: null,
  current: 0,
  score: 0,
  participant: "Participant",
  answers: [],
  locked: false
};

const $ = (id) => document.getElementById(id);
const screens = [$("home-screen"), $("quiz-screen"), $("result-screen")];

function showScreen(id) {
  screens.forEach(s => s.classList.toggle("hidden", s.id !== id));
}

function selectedQuizId() {
  return new URLSearchParams(window.location.search).get("quiz");
}

async function init() {
  const quizId = selectedQuizId();
  if (!quizId || !catalog[quizId]) {
    showPicker();
    return;
  }
  try {
    const response = await fetch(catalog[quizId], { cache: "no-store" });
    if (!response.ok) throw new Error("Impossible de charger la banque de questions.");
    state.quiz = await response.json();
    $("formation-title").textContent = state.quiz.title;
    $("formation-description").textContent = state.quiz.description + ` • ${state.quiz.questions.length} questions`;
    $("participant-form").classList.remove("hidden");
  } catch (error) {
    $("formation-title").textContent = "Erreur de chargement";
    $("load-error").textContent = "Lancez l'application depuis un serveur web (voir README.md). Détail : " + error.message;
    $("load-error").classList.remove("hidden");
  }
}

function showPicker() {
  $("formation-title").textContent = "Choisissez une formation";
  $("formation-description").textContent = "Chaque formation possède sa propre banque de questions et corrections.";
  $("participant-form").classList.add("hidden");
  const picker = $("formation-picker");
  picker.innerHTML = `
    <a href="?quiz=caip">Professionnel certifié en intelligence artificielle (CAIP) — PECB</a>
    <a href="?quiz=spark">Apache Spark : Programmer avec Apache Spark — Databricks</a>`;
  picker.classList.remove("hidden");
}

function startQuiz() {
  const name = $("participant-name").value.trim();
  state.participant = name || "Participant";
  state.current = 0;
  state.score = 0;
  state.answers = [];
  state.locked = false;
  showScreen("quiz-screen");
  renderQuestion();
}

function renderQuestion() {
  state.locked = false;
  $("feedback").className = "feedback hidden";
  $("next-btn").classList.add("hidden");
  const q = state.quiz.questions[state.current];
  $("progress-text").textContent = `Question ${state.current + 1} / ${state.quiz.questions.length}`;
  $("score-live").textContent = `Score : ${state.score}`;
  $("progress-bar").style.width = `${((state.current) / state.quiz.questions.length) * 100}%`;
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

  document.querySelectorAll(".answer-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) btn.classList.add("correct");
    if (i === index && !correct) btn.classList.add("wrong");
  });

  const feedback = $("feedback");
  feedback.className = `feedback ${correct ? "success" : "danger"}`;
  feedback.innerHTML = `<strong>${correct ? "Bonne réponse." : "Réponse incorrecte."}</strong> ${escapeHtml(q.correction)}`;
  $("score-live").textContent = `Score : ${state.score}`;
  $("next-btn").textContent = state.current === state.quiz.questions.length - 1 ? "Voir mon résultat" : "Question suivante";
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

function showResult() {
  showScreen("result-screen");
  $("progress-bar").style.width = "100%";
  const total = state.quiz.questions.length;
  const percent = Math.round((state.score / total) * 100);
  $("participant-result").textContent = `${state.participant} — ${state.quiz.title}`;
  $("final-score").textContent = `${state.score} / ${total}`;
  $("final-message").textContent = `${percent}% de bonnes réponses. ${messageFor(percent)}`;

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
$("participant-name").addEventListener("keydown", e => { if (e.key === "Enter") startQuiz(); });
$("next-btn").addEventListener("click", nextQuestion);
$("restart-btn").addEventListener("click", startQuiz);
$("home-btn").addEventListener("click", () => { window.location.href = window.location.pathname; });

init();

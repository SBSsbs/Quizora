# Quizora — CAIP Certification v9

Version destinée aux sessions de formation CAIP.

## Fonctionnement pédagogique

- Deux quiz CAIP de 40 questions chacun.
- Le participant saisit son nom et son adresse e-mail.
- Pendant le quiz, aucune bonne réponse, aucune correction et aucun score ne sont affichés.
- La réponse choisie est seulement mise en évidence de manière neutre avant de passer à la question suivante.
- À la fin du quiz, l'application affiche le score final, le pourcentage, les résultats par thématique et la correction détaillée de toutes les questions.
- Un rapport PDF complet peut être téléchargé avec le score, les réponses du participant, les réponses attendues et les explications.

## Test local

```bash
python -m http.server 8080
```

Puis ouvrir :

- `http://localhost:8080/?formation=caip`
- `http://localhost:8080/?quiz=caip-quiz-complet-1`
- `http://localhost:8080/?quiz=caip-quiz-complet-2`

## Version

Application : 9.0.0


## Version 10
Ajout de la formation INAR « État de l’art sur l’Intelligence Artificielle » avec un quiz Introduction à l’IA de 20 questions. Les réponses et corrections restent masquées pendant le quiz et sont affichées uniquement dans le rapport final et le PDF.


## Version 12 — Microsoft PL-300
- Nouvelle formation « Design and manage analytics solutions using Power BI (Microsoft PL-300) ».
- Quiz 01 : 20 questions, réponses et explications détaillées, fichier `data/pl300/fondamentaux-power-bi.json`.
- Quiz 02 et 03 affichés « À venir » et non cliquables, aucune question fictive.
- Les quiz existants CAIP, Spark et INAR sont conservés ; correction uniquement en fin de questionnaire et rapport PDF.
- Liens : `?formation=pl300` et `?quiz=pl300-quiz-01`.
- Déploiement Azure Static Web Apps : racine `/`, aucun build nécessaire.

## Version 13 — Microsoft PL-300, Quiz 02
- Quiz 02 activé : 20 questions issues du document fourni, réponses et explications détaillées.
- Fichier `data/pl300/modelisation-dax.json`.
- Quiz 03 toujours à venir.
- Lien : `?quiz=pl300-quiz-02`.
- Aucune correction pendant le quiz ; rapport final et PDF conservés.

## Version 14 — Quiz 03 PL-300

Le troisième quiz de la formation PL-300 est actif (20 QCM et corrigés détaillés).

- Formation : `?formation=pl300`
- Quiz 03 : `?quiz=pl300-quiz-03`
- Banque : `data/pl300/rapports-visualisations.json`

Les bonnes réponses sont présentées seulement après la fin du quiz, avec rapport PDF.

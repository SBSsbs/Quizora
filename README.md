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

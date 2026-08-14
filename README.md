# Quiz Formations — V1

Application web statique de quiz destinée à être partagée aux participants par URL.

## Structure

```text
quiz-formations/
├── index.html
├── README.md
├── start-local.bat
├── start-local.sh
├── netlify.toml
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── data/
    ├── caip/
    │   └── questions.json
    └── spark/
        └── questions.json
```

## Liens des deux formations

Après déploiement, utilisez :

- `https://VOTRE-SITE/?quiz=caip`
- `https://VOTRE-SITE/?quiz=spark`

Sans paramètre `?quiz=...`, l'application affiche un écran permettant de choisir la formation.

## Lancer localement

Le navigateur ne doit pas ouvrir simplement `index.html` en `file://`, car les fichiers JSON sont chargés avec `fetch()`.

### Windows

Double-cliquez sur `start-local.bat`, puis ouvrez :

`http://localhost:8080`

### macOS / Linux

Dans un terminal :

```bash
chmod +x start-local.sh
./start-local.sh
```

Puis ouvrez `http://localhost:8080`.

Python 3 doit être installé.

## Ajouter ou modifier des questions

Modifiez uniquement le fichier JSON de la formation concernée.

Exemple :

```json
{
  "id": "caip-011",
  "category": "Machine Learning",
  "question": "Votre question ?",
  "options": [
    "Réponse A",
    "Réponse B",
    "Réponse C",
    "Réponse D"
  ],
  "correctIndex": 1,
  "correction": "Explication de la bonne réponse."
}
```

`correctIndex` commence à 0 :

- `0` = première réponse
- `1` = deuxième réponse
- `2` = troisième réponse
- `3` = quatrième réponse

Attention à la virgule entre deux objets de question dans le tableau JSON.

## Ajouter une nouvelle formation

1. Créez par exemple `data/nouvelle-formation/questions.json`.
2. Copiez la structure d'un fichier existant et remplacez son contenu.
3. Dans `assets/js/app.js`, ajoutez une entrée dans `catalog` :

```javascript
nouvelle: "data/nouvelle-formation/questions.json"
```

4. Le lien devient : `?quiz=nouvelle`.

## Déploiement simple sur Netlify

Le projet étant statique, vous pouvez déposer tout le dossier sur Netlify. Aucun serveur applicatif ni base de données n'est requis pour cette V1.

Le fichier `netlify.toml` inclus définit le dossier courant comme dossier publié.

## Limite de cette V1

Les réponses et scores restent uniquement dans le navigateur du participant. Ils ne sont pas enregistrés sur un serveur. Une V2 pourra ajouter Supabase pour : identification des participants, enregistrement des tentatives, tableau de bord formateur, statistiques par question et export CSV/Excel.

## Contenu pédagogique

Les questions incluses sont des questions d'entraînement originales. Elles ne sont pas présentées comme des questions officielles PECB ou Databricks et ne reproduisent pas une banque d'examen propriétaire.

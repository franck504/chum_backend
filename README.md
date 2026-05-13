# CHUM Backend

Ce projet est le service backend de l'écosystème CHUM (Centre Hospitalier Universitaire de Madagascar). Il permet la synchronisation cloud des dossiers patients et fournit une interface avec l'assistant médical CHUM AI basé sur Google Gemini.

## Table des matières

- [Technologies](#technologies)
- [Structure du Projet](#structure-du-projet)
- [Installation et Configuration](#installation-et-configuration)
- [Utilisation en Développement](#utilisation-en-développement)
- [Documentation de l'API](#documentation-de-lapi)
- [Déploiement](#déploiement)

## Technologies

- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB (via Mongoose)
- **Validation** : Joi
- **IA** : Google Generative AI (Gemini 1.5 Flash)
- **Hébergement** : Vercel

## Structure du Projet

```text
api/             # Point d'entrée principal pour Vercel
controllers/     # Logique métier (Synchronisation, IA)
models/          # Modèles de données Mongoose (Patient, Profile)
routes/          # Définition des points d'accès API
utils/           # Utilitaires (Connexion DB, formatage IA)
```

## Installation et Configuration

### Prérequis

- Node.js (v18 ou supérieur recommandé)
- Un compte MongoDB Atlas
- Une clé API Google AI Studio (pour Gemini)

### Étapes d'installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/votre-repo/chum_backend.git
   cd chum_backend
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :
   Copiez le fichier d'exemple et remplissez-le avec vos accès :
   ```bash
   cp .env.example .env
   ```
   Variables requises :
   - `MONGODB_URI` : URL de connexion MongoDB Atlas.
   - `GEMINI_API_KEY` : Clé API pour l'IA.

## Utilisation en Développement

Pour lancer le serveur localement avec rechargement automatique :
```bash
npm run dev
```
Le serveur sera disponible sur `http://localhost:3000`.

## Documentation de l'API

### Synchronisation (`/api/sync`)

#### GET `/summary/:matricule`
Récupère un résumé de l'état de synchronisation pour un praticien.
- **Paramètre** : `matricule` (RPPS du médecin)
- **Réponse** : Date de dernière modification et nombre de patients.

#### POST `/push`
Envoie des données pour sauvegarde ou mise à jour.
- **Corps (JSON)** :
  ```json
  {
    "matricule": "12345678",
    "type": "patient" | "profile",
    "data": { ... }
  }
  ```
- **Validation** : Les données sont validées via Joi avant d'être persistées.

#### GET `/pull/:matricule`
Récupère l'intégralité des données sauvegardées.

### Assistant Médical (`/api/ai`)

#### POST `/chat`
Communique avec l'assistant CHUM AI.
- **Corps (JSON)** :
  ```json
  {
    "message": "Ma question...",
    "history": [],
    "patientContext": { ... }
  }
  ```
- **Note** : Le `patientContext` est automatiquement formaté pour optimiser la réponse de l'IA.

## Déploiement

Le projet est configuré pour être déployé sur **Vercel**. 

1. Connectez votre compte Vercel à votre dépôt GitHub.
2. Ajoutez les variables d'environnement (`MONGODB_URI`, `GEMINI_API_KEY`) dans les paramètres Vercel.
3. Le déploiement s'effectue automatiquement sur la branche `main`.

---

Pour toute question technique, veuillez vous référer aux commentaires dans le code source qui expliquent les choix d'implémentation.

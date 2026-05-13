# CHUM Backend

Ce dépôt contient le code source du backend pour l'écosystème CHUM (Centre Hospitalier Universitaire de Madagascar). Il assure la synchronisation cloud des dossiers patients et l'intégration de l'assistant médical basé sur l'IA.

## Technologies utilisées

- Runtime : Node.js (ExpressJS)
- Hébergement : Vercel (Fonctions Serverless)
- Base de données : MongoDB Atlas
- IA : Google Generative AI (Gemini Flash)

## Configuration et Déploiement

### 1. Base de données (MongoDB Atlas)

1. Créez un cluster sur MongoDB Atlas.
2. Configurez un utilisateur et autorisez l'accès réseau (IP Whitelisting) pour toutes les adresses (0.0.0.0/0) afin de permettre les connexions depuis Vercel.
3. Récupérez votre chaîne de connexion (Connection String).

### 2. Variables d'Environnement

Le projet nécessite les variables suivantes pour fonctionner, que ce soit en local (via un fichier .env) ou sur Vercel :

- MONGODB_URI : L'URL de connexion à votre base de données MongoDB.
- GEMINI_API_KEY : Votre clé API pour l'accès aux modèles Google Gemini.

### 3. Déploiement sur Vercel

1. Liez ce dépôt à un nouveau projet sur Vercel.
2. Ajoutez les variables d'environnement mentionnées ci-dessus dans les paramètres du projet.
3. Le déploiement s'effectue automatiquement à chaque mise à jour de la branche principale.
4. Une fois déployé, mettez à jour l'URL du point d'entrée dans les services de synchronisation de l'application cliente (Flutter).

## Points d'entrée de l'API (Endpoints)

### État du service
- GET /api/status : Vérifie la disponibilité du backend.

### Synchronisation
- GET /api/sync/summary/:matricule : Récupère un état rapide de la synchronisation pour un utilisateur donné.
- POST /api/sync/push : Envoie ou met à jour un patient ou un profil dans le cloud.
- GET /api/sync/pull/:matricule : Récupère l'intégralité des données associées à un matricule.

### Intelligence Artificielle
- POST /api/ai/chat : Point d'entrée pour interagir avec l'assistant CHUM AI.

## Maintenance et Tests

Pour tester en local, utilisez la commande suivante après avoir configuré votre fichier .env :
npm run dev

Les journaux de test et les exemples d'appels API sont documentés dans le fichier api_test_logs.md.

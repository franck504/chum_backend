# CHUM Backend

Ce backend permet la synchronisation cloud des dossiers patients de l'application CHUM.

## 🛠 Technologies
- **Runtime** : Node.js (ExpressJS)
- **Hébergement** : Vercel (Serverless Functions)
- **Base de données** : MongoDB Atlas

## 🚀 Configuration & Déploiement

### 1. Base de données (MongoDB Atlas)
1. Créez un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Créez un utilisateur et autorisez l'accès depuis n'importe quelle IP (`0.0.0.0/0`).
3. Récupérez votre **Connection String** (ex: `mongodb+srv://user:pass@cluster...`).

### 2. Variables d'Environnement
Dans Vercel ou en local (`.env`), configurez :
```env
MONGODB_URI=votre_connexion_string_mongodb
```

### 3. Configuration Vercel & GitHub
1. Créez un projet sur Vercel lié à ce dépôt GitHub.
2. Ajoutez la variable d'environnement `MONGODB_URI` dans les paramètres de Vercel.
3. Vercel déploiera automatiquement à chaque commit sur `main`.
3. Une fois déployé, récupérez l'URL (ex: `https://chum-backend.vercel.app`) et mettez-la à jour dans `lib/core/services/sync_service.dart` sur Flutter.

## 📡 API Endpoints
- `GET /api/status` : Vérifie si le serveur est en ligne.
- `POST /api/sync/push` : Envoie un patient ou un profil au cloud.
- `GET /api/sync/pull/:matricule` : Récupère toutes les données associées à un matricule professionnel.

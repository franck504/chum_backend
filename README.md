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

### 3. Déploiement sur Vercel
1. Installez Vercel CLI : `npm i -g vercel`
2. Déployez depuis le dossier `chum_backend` :
   ```bash
   vercel
   ```
3. Une fois déployé, récupérez l'URL (ex: `https://chum-backend.vercel.app`) et mettez-la à jour dans `lib/core/services/sync_service.dart` sur Flutter.

## 📡 API Endpoints
- `GET /api/status` : Vérifie si le serveur est en ligne.
- `POST /api/sync/push` : Envoie un patient ou un profil au cloud.
- `GET /api/sync/pull/:matricule` : Récupère toutes les données associées à un matricule professionnel.

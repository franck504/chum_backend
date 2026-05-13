require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../utils/db');

// Import des routes
const syncRoutes = require('../routes/syncRoutes');
const aiRoutes = require('../routes/aiRoutes');

const app = express();

// Vérification minimale des variables d'environnement critiques au démarrage
const requiredEnv = ['MONGODB_URI', 'GEMINI_API_KEY'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.warn(`Attention : La variable d'environnement ${env} n'est pas définie.`);
    }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Connexion à la base de données
connectDB();

// Point d'entrée pour tester l'état du serveur
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'CHUM Backend Operational', 
        time: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Montage des modules de routes
app.use('/api/sync', syncRoutes);
app.use('/api/ai', aiRoutes);

// Gestion du démarrage local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Le serveur est opérationnel sur http://localhost:${PORT}`);
    });
}

// Export pour l'environnement Vercel
module.exports = app;

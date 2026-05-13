const mongoose = require('mongoose');

// Variable locale pour garder trace de l'état de la connexion
let isConnected = false;

/**
 * Fonction de connexion à MongoDB Atlas.
 * Sur Vercel, les instances sont réutilisées. Mongoose gère le pool de connexions,
 * mais on vérifie quand même si on est déjà connecté pour éviter les tentatives multiples.
 */
const connectDB = async () => {
    if (isConnected) {
        console.log('Utilisation de la connexion MongoDB existante.');
        return;
    }

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('La variable MONGODB_URI n\'est pas définie dans l\'environnement.');
        }

        // On se connecte sans options dépréciées (Mongoose 6+ les gère par défaut)
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        // On met à jour l'état global
        isConnected = !!conn.connections[0].readyState;
        
        console.log(`Base de données connectée : ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur de connexion à MongoDB : ${error.message}`);
        // Dans un environnement Serverless comme Vercel, on préfère renvoyer l'erreur
        // plutôt que de couper le processus avec process.exit().
        throw error;
    }
};

module.exports = connectDB;

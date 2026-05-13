require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../utils/db');
const Patient = require('../models/Patient');
const Profile = require('../models/Profile');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Configuration des middlewares de base
app.use(cors());
app.use(express.json());

// On initialise la connexion à la base de données. 
// Mongoose gère le maintien de la connexion, ce qui est idéal pour l'environnement Vercel.
connectDB();

// Initialisation de Gemini avec les directives spécifiques au CHUM
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: `Tu es "CHUM AI", un assistant spécialisé intégré à l'écosystème CHUM (Centre Hospitalier Universitaire de Madagascar). 
Ton objectif est de soutenir la révolution numérique en santé en assistant les praticiens et les étudiants.

DIRECTIVES DE RÉPONSE :
1. TON : Professionnel, factuel, médicalement rigoureux et bienveillant.
2. CONTEXTE SANITAIRE : Toutes tes réponses doivent respecter les standards de soins actuels. Ne donne jamais de conseils "généralistes" si une précision médicale est requise.
3. STRUCTURE : Utilise des listes à puces ou des étapes claires pour faciliter la lecture durant la consultation.
4. ANALYSE PATIENT : Si des données patients sont fournies (température, TA, signes cliniques), identifie prioritairement les signes d'urgence ou de gravité.
5. ÉTHIQUE : Rappelle systématiquement que ton avis est un outil d'assistance et que la responsabilité finale du diagnostic et du traitement incombe exclusivement au médecin.

INTERDICTION : Ne sors jamais de ton rôle de conseiller médical pour CHUM.`,
});

// Endpoint simple pour vérifier que tout tourne correctement
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'CHUM Backend Operational', 
        time: new Date(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * Récupère un résumé rapide pour la synchronisation (Smart Sync).
 * On vérifie la date de dernière modification pour savoir si une mise à jour est nécessaire.
 */
app.get('/api/sync/summary/:matricule', async (req, res) => {
    try {
        const { matricule } = req.params;

        // On récupère juste le timestamp pour gagner en performance
        const profile = await Profile.findOne({ rpps: matricule }, { lastModified: 1 });

        // Idem pour le dernier patient modifié par ce praticien
        const latestPatient = await Patient.findOne(
            { practitionerMatricule: matricule },
            { lastModified: 1 }
        ).sort({ lastModified: -1 });

        const patientCount = await Patient.countDocuments({ practitionerMatricule: matricule });

        let lastModified = profile?.lastModified || new Date(0);
        if (latestPatient && latestPatient.lastModified > lastModified) {
            lastModified = latestPatient.lastModified;
        }

        res.json({
            lastModified,
            patientCount,
            hasProfile: !!profile
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du résumé :', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la génération du résumé.' });
    }
});

/**
 * Route pour envoyer des données (PUSH).
 * Gère à la fois les profils et les dossiers patients via un "upsert".
 */
app.post('/api/sync/push', async (req, res) => {
    try {
        const { matricule, type, data } = req.body;

        if (!matricule || !type || !data) {
            return res.status(400).json({ error: 'Champs obligatoires manquants (matricule, type ou data).' });
        }

        if (type === 'patient') {
            // On utilise l'UUID comme clé unique pour éviter les doublons
            await Patient.findOneAndUpdate(
                { uuid: data.uuid },
                { ...data, practitionerMatricule: matricule },
                { upsert: true, new: true }
            );
        } else if (type === 'profile') {
            // Le matricule (RPPS) sert d'identifiant unique pour le profil
            await Profile.findOneAndUpdate(
                { rpps: matricule },
                { ...data },
                { upsert: true, new: true }
            );
        } else {
            return res.status(400).json({ error: 'Type de synchronisation inconnu.' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors du push de données :', error);
        res.status(500).json({ error: 'Impossible de synchroniser les données.' });
    }
});

/**
 * Récupère l'intégralité des données pour un praticien (PULL).
 */
app.get('/api/sync/pull/:matricule', async (req, res) => {
    try {
        const { matricule } = req.params;

        // On récupère tout d'un coup : profil et liste des patients
        const [profile, patients] = await Promise.all([
            Profile.findOne({ rpps: matricule }),
            Patient.find({ practitionerMatricule: matricule })
        ]);

        res.json({ profile, patients });
    } catch (error) {
        console.error('Erreur lors du pull de données :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données de sauvegarde.' });
    }
});

/**
 * Proxy pour l'IA Gemini. 
 * Permet de discuter avec l'assistant en lui passant le contexte du patient si besoin.
 */
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history, patientContext } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Configuration IA manquante sur le serveur (clé API absente).'
            });
        }

        const chat = model.startChat({
            history: history || [],
        });

        // Si on a un contexte patient, on le préfixe à la question pour que l'IA en tienne compte
        let fullMessage = message;
        if (patientContext) {
            fullMessage = `CONTEXTE PATIENT : \n${JSON.stringify(patientContext)}\n\nQUESTION : \n${message}`;
        }

        const result = await chat.sendMessage(fullMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Erreur AI Proxy :', error);
        res.status(500).json({ error: 'Désolé, une erreur est survenue lors de la communication avec l\'assistant médical.' });
    }
});

// Démarrage du serveur pour le développement local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Le serveur est lancé sur http://localhost:${PORT}`);
    });
}

// Export pour Vercel
module.exports = app;

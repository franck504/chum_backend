require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../utils/db');
const Patient = require('../models/Patient');
const Profile = require('../models/Profile');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

// Connexion à la DB (Vercel réutilise les instances, connectDB gère ça via Mongoose)
connectDB();

// Configuration Gemini
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

app.get('/api/status', (req, res) => {
    res.json({ status: 'CHUM Backend Operational', time: new Date() });
});

// Route pour obtenir un résumé rapide (Smart Sync)
app.get('/api/sync/summary/:matricule', async (req, res) => {
    try {
        const { matricule } = req.params;

        // Récupérer le dernier timestamp du profil
        const profile = await Profile.findOne({ rpps: matricule }, { lastModified: 1 });

        // Récupérer le dernier timestamp des patients
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
        console.error('Summary Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route de synchronisation : PUSH
app.post('/api/sync/push', async (req, res) => {
    try {
        const { matricule, type, data } = req.body;

        if (!matricule || !type || !data) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (type === 'patient') {
            // Upsert basé sur l'UUID pour les patients
            await Patient.findOneAndUpdate(
                { uuid: data.uuid },
                { ...data, practitionerMatricule: matricule },
                { upsert: true, new: true }
            );
        } else if (type === 'profile') {
            // Upsert basé sur le matricule (rpps) pour le profil
            await Profile.findOneAndUpdate(
                { rpps: matricule },
                { ...data },
                { upsert: true, new: true }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Push Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route de synchronisation : PULL/RESTORE
app.get('/api/sync/pull/:matricule', async (req, res) => {
    try {
        const { matricule } = req.params;

        const profile = await Profile.findOne({ rpps: matricule });
        const patients = await Patient.find({ practitionerMatricule: matricule });

        res.json({ profile, patients });
    } catch (error) {
        console.error('Pull Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route AI Proxy
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history, patientContext } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'AI Configuration error: GEMINI_API_KEY is missing on server.'
            });
        }

        const chat = model.startChat({
            history: history || [],
        });

        let fullMessage = message;
        if (patientContext) {
            fullMessage = `CONTEXTE PATIENT : \n${JSON.stringify(patientContext)}\n\nQUESTION : \n${message}`;
        }

        const result = await chat.sendMessage(fullMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('AI Proxy Error:', error);
        res.status(500).json({ error: 'Erreur lors de la communication avec l\'IA.' });
    }
});

// Exporter pour Vercel
// Démarrage local (si pas sur Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;


//trigger build and redeploy

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../utils/db');
const Patient = require('../models/Patient');
const Profile = require('../models/Profile');

const app = express();

app.use(cors());
app.use(express.json());

// Connexion à la DB (Vercel réutilise les instances, connectDB gère ça via Mongoose)
connectDB();

app.get('/api/status', (req, res) => {
    res.json({ status: 'CHUM Backend Operational', time: new Date() });
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

// Exporter pour Vercel
// Démarrage local (si pas sur Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;

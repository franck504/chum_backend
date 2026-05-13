const Joi = require('joi');
const Patient = require('../models/Patient');
const Profile = require('../models/Profile');

/**
 * Schéma de validation pour le PUSH de données.
 * On s'assure que les champs critiques sont présents et au bon format.
 */
const pushSchema = Joi.object({
    matricule: Joi.string().required(),
    type: Joi.string().valid('patient', 'profile').required(),
    data: Joi.object().required().min(1)
});

/**
 * Récupère un résumé rapide de l'état de synchronisation.
 */
exports.getSummary = async (req, res) => {
    try {
        const { matricule } = req.params;

        const [profile, latestPatient, patientCount] = await Promise.all([
            Profile.findOne({ rpps: matricule }, { lastModified: 1 }),
            Patient.findOne({ practitionerMatricule: matricule }, { lastModified: 1 }).sort({ lastModified: -1 }),
            Patient.countDocuments({ practitionerMatricule: matricule })
        ]);

        let lastModified = profile?.lastModified || new Date(0);
        if (latestPatient && latestPatient.lastModified > lastModified) {
            lastModified = latestPatient.lastModified;
        }

        res.json({ lastModified, patientCount, hasProfile: !!profile });
    } catch (error) {
        console.error('Erreur Résumé Sync :', error);
        res.status(500).json({ error: 'Erreur lors de la génération du résumé de synchronisation.' });
    }
};

/**
 * Gère l'envoi de données vers le cloud (UPSERT).
 */
exports.pushData = async (req, res) => {
    try {
        // Validation avec Joi
        const { error, value } = pushSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: `Données invalides : ${error.details[0].message}` });
        }

        const { matricule, type, data } = value;

        if (type === 'patient') {
            await Patient.findOneAndUpdate(
                { uuid: data.uuid },
                { ...data, practitionerMatricule: matricule },
                { upsert: true, new: true }
            );
        } else {
            await Profile.findOneAndUpdate(
                { rpps: matricule },
                { ...data },
                { upsert: true, new: true }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur Push Sync :', error);
        res.status(500).json({ error: 'Échec de la synchronisation des données.' });
    }
};

/**
 * Récupère l'intégralité des données de sauvegarde pour un praticien.
 */
exports.pullData = async (req, res) => {
    try {
        const { matricule } = req.params;

        const [profile, patients] = await Promise.all([
            Profile.findOne({ rpps: matricule }),
            Patient.find({ practitionerMatricule: matricule })
        ]);

        res.json({ profile, patients });
    } catch (error) {
        console.error('Erreur Pull Sync :', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des données.' });
    }
};

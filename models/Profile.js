const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    rpps: { type: String, required: true, unique: true }, // Matricule servant d'ID unique
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    profession: { type: String, required: true },
    specialite: String,
    telephone: String,
    email: String,
    lastModified: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);

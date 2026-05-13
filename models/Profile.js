const mongoose = require('mongoose');

/**
 * Schéma pour le profil d'un utilisateur (praticien ou étudiant).
 * Le matricule (RPPS) est utilisé comme identifiant unique de synchronisation.
 */
const ProfileSchema = new mongoose.Schema({
    // Matricule servant d'identifiant unique pour relier les données
    rpps: { type: String, required: true, unique: true }, 
    
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    profession: { type: String, required: true },
    specialite: String,
    telephone: String,
    email: String,
    
    // Date de dernière modification pour la synchronisation intelligente
    lastModified: { type: Date, required: true },
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Profile', ProfileSchema);

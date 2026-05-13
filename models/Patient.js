const mongoose = require('mongoose');

/**
 * Schéma représentant un dossier patient dans l'écosystème CHUM.
 * Ce modèle stocke à la fois les informations administratives et les données cliniques.
 */
const PatientSchema = new mongoose.Schema({
  // Identifiant unique généré par l'application mobile (UUID)
  uuid: { type: String, required: true, unique: true },
  
  // Matricule du praticien (RPPS) qui a créé ou gère ce dossier
  practitionerMatricule: { type: String, required: true, index: true },
  
  // Informations de base
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  genre: String,
  age: Number,
  profession: String,
  adresse: String,
  ethnie: String,
  dateHospitalisation: String,
  contact: String,
  situationMatrimoniale: String,
  
  // Données cliniques
  motifHospitalisation: String,
  histoireMaladie: String,
  
  // Champs flexibles pour les examens et antécédents
  examenClinique: mongoose.Schema.Types.Mixed,
  examensComplementaires: mongoose.Schema.Types.Mixed,
  antecedents: mongoose.Schema.Types.Mixed,
  traitements: mongoose.Schema.Types.Mixed,
  
  // Constantes vitales
  poids: Number,
  taille: Number,
  imc: Number,
  temperature: Number,
  frequenceCardiaque: String,
  frequenceRespiratoire: String,
  spo2: String,
  glycemie: String,
  eva: Number, // Échelle Visuelle Analogique pour la douleur
  tensionArterielle: String,
  
  // Métadonnées de l'application
  practitionerName: String,
  lastModified: { type: Date, required: true },
  serviceTag: String, // Tag permettant d'organiser les patients par service/département
  boxName: String,    // Ancien nom pour le dossier/service (gardé pour compatibilité)
}, { 
  timestamps: true // Gère automatiquement createdAt et updatedAt
});

// Indexation pour accélérer les recherches par praticien
PatientSchema.index({ practitionerMatricule: 1 });

module.exports = mongoose.model('Patient', PatientSchema);

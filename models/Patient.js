const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  practitionerMatricule: { type: String, required: true, index: true },
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
  motifHospitalisation: String,
  histoireMaladie: String,
  examenClinique: mongoose.Schema.Types.Mixed,
  examensComplementaires: mongoose.Schema.Types.Mixed,
  antecedents: mongoose.Schema.Types.Mixed,
  traitements: mongoose.Schema.Types.Mixed,
  poids: Number,
  taille: Number,
  imc: Number,
  temperature: Number,
  frequenceCardiaque: String,
  frequenceRespiratoire: String,
  spo2: String,
  glycemie: String,
  eva: Number,
  tensionArterielle: String,
  practitionerName: String,
  lastModified: { type: Date, required: true },
  boxName: String, // Pour savoir dans quel dossier Hive restaurer
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);

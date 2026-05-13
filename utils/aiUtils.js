/**
 * Transforme les données brutes d'un patient en une description textuelle
 * plus facile à interpréter pour l'IA Gemini.
 */
const formatPatientContext = (context) => {
    if (!context) return "";

    const {
        nom, prenom, age, genre, motifHospitalisation, 
        temperature, tensionArterielle, spo2, frequenceCardiaque,
        examenClinique, histoireMaladie
    } = context;

    let summary = "Informations sur le patient actuel :\n";
    
    if (nom || prenom) summary += `- Identité : ${prenom || ''} ${nom || ''}\n`;
    if (age) summary += `- Âge : ${age} ans\n`;
    if (genre) summary += `- Genre : ${genre}\n`;
    if (motifHospitalisation) summary += `- Motif d'hospitalisation : ${motifHospitalisation}\n`;
    
    // Constantes vitales
    let vitals = [];
    if (temperature) vitals.push(`Température: ${temperature}°C`);
    if (tensionArterielle) vitals.push(`TA: ${tensionArterielle}`);
    if (spo2) vitals.push(`SpO2: ${spo2}%`);
    if (frequenceCardiaque) vitals.push(`FC: ${frequenceCardiaque} bpm`);
    
    if (vitals.length > 0) {
        summary += `- Constantes vitales : ${vitals.join(', ')}\n`;
    }

    if (histoireMaladie) summary += `- Histoire de la maladie : ${histoireMaladie}\n`;
    
    return summary;
};

module.exports = { formatPatientContext };

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { formatPatientContext } = require('../utils/aiUtils');

// Initialisation de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: `Tu es "CHUM AI", un assistant spécialisé intégré à l'écosystème CHUM (Centre Hospitalier Universitaire de Madagascar). 
Ton objectif est de soutenir la révolution numérique en santé en assistant les praticiens et les étudiants.

DIRECTIVES DE RÉPONSE :
1. TON : Professionnel, factuel, médicalement rigoureux et bienveillant.
2. CONTEXTE SANITAIRE : Respecte les standards de Madagascar et les ressources disponibles.
3. STRUCTURE : Utilise des listes à puces pour la clarté.
4. ÉTHIQUE : Rappelle que le médecin garde la responsabilité finale.

INTERDICTION : Ne sors jamais de ton rôle de conseiller médical pour CHUM.`,
});

/**
 * Gère les interactions avec l'IA Gemini.
 */
exports.chat = async (req, res) => {
    try {
        const { message, history, patientContext } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'La configuration de l\'IA est incomplète sur le serveur.' });
        }

        const chat = model.startChat({
            history: history || [],
        });

        // On formate le contexte patient de manière lisible au lieu d'un JSON brut
        let formattedMessage = message;
        if (patientContext) {
            const contextText = formatPatientContext(patientContext);
            formattedMessage = `${contextText}\n\nQuestion de l'utilisateur : ${message}`;
        }

        const result = await chat.sendMessage(formattedMessage);
        const response = await result.response;
        
        res.json({ response: response.text() });
    } catch (error) {
        console.error('Erreur Chat AI :', error);
        res.status(500).json({ error: 'Erreur lors de la communication avec l\'assistant médical.' });
    }
};

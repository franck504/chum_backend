const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Définition de la route pour le chat AI
router.post('/chat', aiController.chat);

module.exports = router;

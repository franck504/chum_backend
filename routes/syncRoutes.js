const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// Définition des routes de synchronisation
router.get('/summary/:matricule', syncController.getSummary);
router.post('/push', syncController.pushData);
router.get('/pull/:matricule', syncController.pullData);

module.exports = router;

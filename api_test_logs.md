# CHUM API - Test Log (Vercel Production)
Date: 2026-01-08
Base URL: https://chum-backend.vercel.app/api

## 1. Test Endpoint : Status
**Objectif** : Vérifier que le backend est opérationnel et connecté à MongoDB Atlas.
**Commande** : `curl -X GET https://chum-backend.vercel.app/api/status -i`

**Résultat** : 🛑 **ÉCHEC (Erreur 500)**
```
HTTP/2 500 
content-type: text/plain; charset=utf-8
x-vercel-error: FUNCTION_INVOCATION_FAILED
```
**Analyse** : Le backend crash au démarrage sur Vercel. Causes possibles : variable `MONGODB_URI` manquante sur Vercel, ou erreur dans `utils/db.js`.
---

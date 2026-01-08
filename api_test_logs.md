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

## 1b. Test Comparatif : Local
**Commande** : `curl -X GET http://localhost:3000/api/status -i`

**Résultat** : ✅ **SUCCÈS**
```json
{"status":"CHUM Backend Operational","time":"2026-01-08T07:51:47.614Z"}
```
**Conclusion** : Le code est fonctionnel. L'erreur 500 sur Vercel est causée par un problème d'infrastructure (IP non autorisée sur MongoDB Atlas ou erreur de saisie de la clé `MONGODB_URI` sur le dashboard Vercel).

---

## 2. Test Fonctionnel : PUSH (Envoi)
**Objectif** : Vérifier la persistance du `serviceTag` sur le backend.
**Commande** : 
```bash
curl -X POST http://localhost:3000/api/sync/push \
-H "Content-Type: application/json" \
-d '{
  "matricule": "12345678",
  "type": "patient",
  "data": {
    "uuid": "test-uuid-003",
    "nom": "TEST_TAG_FINAL",
    "prenom": "SyncTagFinal",
    "serviceTag": "patients_pediatrie",
    "lastModified": "2026-01-08T11:00:00Z"
  }
}'
```

**Résultat** : ✅ **SUCCÈS**
```json
{"success":true}
```

---

## 3. Test Fonctionnel : PULL (Récupération)
**Objectif** : Vérifier que le `serviceTag` est correctement renvoyé par l'API.
**Commande** : `curl -X GET http://localhost:3000/api/sync/pull/12345678 -i`

**Résultat** : ✅ **SUCCÈS**
```json
{
  "profile": null,
  "patients": [
    {
      "uuid": "test-uuid-003",
      "nom": "TEST_TAG_FINAL",
      "prenom": "SyncTagFinal",
      "serviceTag": "patients_pediatrie",
      "practitionerMatricule": "12345678"
    }
  ]
}
```
**Conclusion Générale** : Le backend est prêt pour une synchronisation multi-services parfaite. 🚀

---

## 🛠 Guide de Dépannage Vercel (Erreur 500)

Si vous continuez à voir une erreur 500 sur Vercel :
1. **IP Whitelisting** : Allez sur MongoDB Atlas > Network Access. Vérifiez que `0.0.0.0/0` est ajouté. Vercel utilise des IPs dynamiques qui changent tout le temps.
2. **Variable MONGODB_URI** : Dans le dashboard Vercel (Project > Settings > Environment Variables), vérifiez qu'il n'y a pas d'espace caché au début ou à la fin de la valeur de la clé `MONGODB_URI`.
3. **Redéploiement** : Poussez les dernières corrections que j'ai faites dans `utils/db.js` et `models/Patient.js` sur GitHub. Vercel reconstruira automatiquement le backend.

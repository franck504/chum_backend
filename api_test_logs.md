# CHUM API - Journal de Test (Production Vercel)

Date : 2026-01-08
URL de base : https://chum-backend.vercel.app/api

## 1. Test du point d'entrée : Status

Objectif : Vérifier que le backend est opérationnel et correctement connecté à MongoDB Atlas.
Commande : curl -X GET https://chum-backend.vercel.app/api/status -i

Résultat : SUCCÈS
```json
{"status":"CHUM Backend Operational","time":"2026-01-08T08:01:48.751Z"}
```
Analyse : Le backend est opérationnel et la connexion à la base de données est établie.

---

## 2. Test de synchronisation : PUSH et PULL (Production)

Objectif : Valider le cycle complet de sauvegarde et de récupération des données.
Commandes :

```bash
# PUSH
curl -X POST https://chum-backend.vercel.app/api/sync/push -H "Content-Type: application/json" -d '{"matricule":"87654321","type":"patient","data":{"uuid":"prod-uuid-001","nom":"PROD","serviceTag":"patients_pediatrie","lastModified":"2026-01-08T11:00:00Z"}}'

# PULL
curl -X GET https://chum-backend.vercel.app/api/sync/pull/87654321
```

Résultat : SUCCÈS
- Envoi : {"success":true}
- Récupération : Les données, incluant le serviceTag, sont correctement récupérées.

---

## 3. Test local comparatif

Commande : curl -X GET http://localhost:3000/api/status -i

Résultat : SUCCÈS
```json
{"status":"CHUM Backend Operational","time":"2026-01-08T07:51:47.614Z"}
```
Conclusion : Le code est fonctionnel localement. Les erreurs éventuelles sur Vercel sont généralement dues à des restrictions d'adresses IP ou des configurations de variables d'environnement.

---

## Guide de dépannage (Erreur 500 sur Vercel)

Si une erreur 500 survient en production :

1. Accès réseau (IP Whitelisting) : Dans MongoDB Atlas > Network Access, vérifiez que l'accès est autorisé depuis n'importe quelle adresse (0.0.0.0/0). Vercel utilise des adresses IP dynamiques.
2. Variables d'environnement : Vérifiez qu'il n'y a pas d'espaces ou de caractères invisibles dans la valeur de MONGODB_URI dans le tableau de bord Vercel.
3. Déploiement : Assurez-vous que les dernières modifications du code ont bien été poussées sur la branche principale pour déclencher un redéploiement.

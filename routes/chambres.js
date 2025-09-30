// Import d’Express pour créer un routeur
const express = require('express');
const router = express.Router();

// Import du contrôleur qui contient la logique métier
const chambreController = require('../controllers/chambreController');

/**
 * Route : GET /chambres
 * Description : Affiche la liste des chambres
 * et le lien vers le formulaire d’ajout
 */
router.get('/', chambreController.index);

/**
 * Route : GET /chambres/create
 * Description : Affiche le formulaire de création d’une chambre
 */
router.get('/create', chambreController.createForm);

/**
 * Route : POST /chambres/create
 * Description : Récupère les données envoyées par le formulaire
 * et ajoute une nouvelle chambre en base
 */
router.post('/create', chambreController.create);

/**
 * Route : GET /chambres/:id/edit
 * Description : Affiche le formulaire d’édition d’une chambre existante
 * :id correspond à l’identifiant de la chambre dans l’URL
 */
router.get('/edit', chambreController.editForm);

/**
 * Route : POST /chambres/:id/edit
 * Description : Met à jour la chambre en base avec les nouvelles infos
 * envoyées depuis le formulaire
 */
router.post('/edit', chambreController.update);

/**
 * Route : POST /chambres/:id/delete
 * Description : Supprime une chambre identifiée par son id
 */
router.post('/delete', chambreController.remove);

// On exporte le routeur pour qu’il soit utilisé dans app.js
module.exports = router;

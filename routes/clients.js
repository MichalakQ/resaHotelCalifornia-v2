// Import d’Express pour créer un routeur
const express = require('express');
const router = express.Router();

// Import du contrôleur qui contient la logique métier
const clientController = require('../controllers/clientController');

/**
 * Route : GET /chambres
 * Description : Affiche la liste des chambres
 * et le lien vers le formulaire d’ajout
 */
router.get('/', clientController.index);

/**
 * Route : GET /chambres/create
 * Description : Affiche le formulaire de création d’un client
 */
router.get('/create', clientController.createForm);

/**
 * Route : POST /chambres/create
 * Description : Récupère les données envoyées par le formulaire
 * et ajoute un nouveau client en base
 */
router.post('/:id/create', clientController.create);

/**
 * Route : GET /chambres/:id/edit
 * Description : Affiche le formulaire d’édition d’une chambre existante
 * :id correspond à l’identifiant de la chambre dans l’URL
 */
router.get('/:id/edit', clientController.editForm);

/**
 * Route : POST /chambres/:id/edit
 * Description : Met à jour la chambre en base avec les nouvelles infos
 * envoyées depuis le formulaire
 */
router.post('/:id/edit', clientController.update);

/**
 * Route : POST /chambres/:id/delete
 * Description : Supprime une chambre identifiée par son id
 */
router.post('/:id/delete', clientController.remove);

// On exporte le routeur pour qu’il soit utilisé dans app.js
module.exports = router;
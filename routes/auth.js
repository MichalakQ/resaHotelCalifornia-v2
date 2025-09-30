// Import d’Express pour créer un routeur
const express = require('express');
const router = express.Router();

// Import du contrôleur qui contient la logique métier
const authController = require('../controllers/authController');

/**
 * Route : GET /chambres
 * Description : Affiche la liste des chambres
 * et le lien vers le formulaire d’ajout
 */
router.get('/', authController.index);

/**
 * Route : GET /chambres/create
 * Description : Affiche le formulaire de création d’une connexion
 */
router.get('/create', authController.createForm);

/**
 * Route : POST /chambres/create
 * Description : Récupère les données envoyées par le formulaire
 * et ajoute un nouveau client en base
 */
router.post('/:id/create', authController.create);

/**
 * Route : GET /chambres/:id/edit
 * Description : Affiche le formulaire d’édition d’une chambre existante
 * :id correspond à l’identifiant de la chambre dans l’URL
 */
router.get('/:id/edit', authController.editForm);

/**
 * Route : POST /chambres/:id/edit
 * Description : Met à jour la chambre en base avec les nouvelles infos
 * envoyées depuis le formulaire
 */
router.post('/:id/edit', authController.update);

/**
 * Route : POST /chambres/:id/delete
 * Description : Supprime une chambre identifiée par son id
 */
router.post('/:id/delete', authController.remove);

// On exporte le routeur pour qu’il soit utilisé dans app.js
module.exports = router;
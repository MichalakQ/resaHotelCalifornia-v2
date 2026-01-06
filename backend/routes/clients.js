// Import d'Express pour créer un routeur
import express from 'express';
const router = express.Router();

// Import du contrôleur qui contient la logique métier
import clientController from '../controllers/clientController.js';

/**
 * Route : GET /clients
 * Description : Affiche la liste des clients
 * et le lien vers le formulaire d'ajout
 */
router.get('/', clientController.index);

/**
 * Route : GET /clients/create
 * Description : Affiche le formulaire de création d'un client
 */
router.get('/create', clientController.createForm);

/**
 * Route : POST /clients/create
 * Description : Récupère les données envoyées par le formulaire
 * et ajoute un nouveau client en base
 */
router.post('/create', clientController.create);

/**
 * Route : GET /clients/:id/edit
 * Description : Affiche le formulaire d'édition d'un client existant
 * :id correspond à l'identifiant du client dans l'URL
 */
router.get('/:id/edit', clientController.editForm);

/**
 * Route : POST /clients/:id/edit
 * Description : Met à jour le client en base avec les nouvelles infos
 * envoyées depuis le formulaire
 */
router.post('/:id/edit', clientController.update);

/**
 * Route : POST /clients/:id/delete
 * Description : Supprime un client identifié par son id
 */
router.post('/:id/delete', clientController.remove);

// On exporte le routeur pour qu'il soit utilisé dans app.js
export default router;
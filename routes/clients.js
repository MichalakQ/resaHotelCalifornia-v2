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
 * Route : POST /clients/create
 * Description : Récupère les données envoyées par le formulaire
 * et ajoute un nouveau client en base
 */
router.post('/create', clientController.create);

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
router.delete('/:id/delete', clientController.remove);

// On exporte le routeur pour qu'il soit utilisé dans app.js
export default router;
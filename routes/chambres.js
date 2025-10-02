// Import d'Express pour créer un routeur
import express from 'express';
const router = express.Router();

// Import du contrôleur qui contient la logique métier
import ChambreController from '../controllers/chambreController.js';

/**
 * Route : GET /chambres
 * Description : Affiche la liste des chambres
 * et le lien vers le formulaire d'ajout
 */
router.get('/', ChambreController.index);

/**
 * Route : GET /chambres/create
 * Description : Affiche le formulaire de création d'une chambre
 */
router.get('/create', ChambreController.create);

/**
 * Route : POST /chambres/create
 * Description : Récupère les données envoyées par le formulaire
 * et ajoute une nouvelle chambre en base
 */
router.post('/create', ChambreController.store);

/**
 * Route : GET /chambres/:id/edit
 * Description : Affiche le formulaire d'édition d'une chambre existante
 * :id correspond à l'identifiant de la chambre dans l'URL
 */
router.get('/:id/edit', ChambreController.edit);

/**
 * Route : POST /chambres/:id/edit
 * Description : Met à jour la chambre en base avec les nouvelles infos
 * envoyées depuis le formulaire
 */
router.post('/:id/edit', ChambreController.update);

/**
 * Route : GET /chambres/:id/delete
 * Description : Affiche la page de confirmation de suppression
 */
router.get('/:id/delete', ChambreController.delete);

/**
 * Route : POST /chambres/:id/delete
 * Description : Supprime une chambre identifiée par son id
 */
router.post('/:id/delete', ChambreController.destroy);

// On exporte le routeur pour qu'il soit utilisé dans app.js
export default router;
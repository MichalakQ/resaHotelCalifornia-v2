// Import d'Express pour créer un routeur
import express from 'express';
import ChambreController from '../controllers/chambreController.js';
const router = express.Router();

// Liste
router.get('/', ChambreController.index);

// Créer - formulaire
router.get('/create', ChambreController.create);

// Créer - traitement
router.post('/', ChambreController.store);

// Éditer - formulaire
router.get('/:id/edit', ChambreController.edit);

// Éditer - traitement
router.post('/:id/edit', ChambreController.update);  // POST /:id/edit

// Supprimer - confirmation
router.get('/:id/delete', ChambreController.delete);

// Supprimer - traitement
router.post('/:id/delete', ChambreController.destroy);  //  POST /:id/delete

export default router;
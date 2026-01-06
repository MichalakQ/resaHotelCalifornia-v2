// Import d'Express pour créer un routeur
import express from 'express';
import ReservationController from '../controllers/reservationController.js';
const router = express.Router();

// Liste
router.get('/', ReservationController.index);

// Créer - formulaire
router.get('/create', ReservationController.create);

// Créer - traitement
router.post('/', ReservationController.store);

// Éditer - formulaire
router.get('/:id/edit', ReservationController.edit);

// Éditer - traitement
router.post('/:id/edit', ReservationController.update);  // ✅ POST /:id/edit

// Supprimer - confirmation
router.get('/:id/delete', ReservationController.delete);

// Supprimer - traitement
router.post('/:id/delete', ReservationController.destroy);  // ✅ POST /:id/delete

export default router;
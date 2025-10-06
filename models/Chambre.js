import express from 'express';
import { body } from 'express-validator';
import ChambreController from '../controllers/chambreController.js';
const router = express.Router();
// Validation des données de chambre
const chambreValidation = [
    body('numero')
        .notEmpty()
        .withMessage('Le numéro de chambre est obligatoire')
        .isLength({ min: 1, max: 10 })
        .withMessage('Le numéro doit faire entre 1 et 10 caractères'),
    body('capacite')
        .isInt({ min: 1, max: 50 })
        .withMessage('La capacité doit être un nombre entre 1 et 50')
];
router.get('/', ChambreController.index);
router.get('/create', ChambreController.create);
router.post('/', chambreValidation, ChambreController.store);
router.get('/:id/edit', ChambreController.edit);
router.put('/:id', chambreValidation, ChambreController.update);
router.get('/:id/delete', ChambreController.delete);
router.delete('/:id', ChambreController.destroy);
module.exports = router;
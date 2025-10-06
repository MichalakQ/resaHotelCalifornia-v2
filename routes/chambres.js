// Import d'Express pour créer un routeur
import express from 'express';
const router = express.Router();

router.get('/', ChambreController.index);
router.get('/create', ChambreController.create);
router.post('/', chambreValidation, ChambreController.store);
router.get('/:id/edit', ChambreController.edit);
router.put('/:id', chambreValidation, ChambreController.update);
router.get('/:id/delete', ChambreController.delete);
router.delete('/:id', ChambreController.destroy);
export default router;
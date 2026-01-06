// Import d'Express pour créer un routeur
import express from 'express';
const router = express.Router();

// Import du contrôleur qui contient la logique métier
import employeController from '../controllers/Employe.js';

/**
 * Route : GET /employes
 * Description : Affiche la liste des employés
 */
router.get('/', employeController.index);

/**
 * Route : GET /employes/create
 * Description : Affiche le formulaire de création d'un employé
 */
router.get('/create', employeController.createForm);

/**
 * Route : POST /employes/create
 * Description : Crée un nouvel employé
 */
router.post('/create', employeController.create);

/**
 * Route : GET /employes/:id/edit
 * Description : Affiche le formulaire d'édition d'un employé
 */
router.get('/:id/edit', employeController.editForm);

/**
 * Route : POST /employes/:id/edit
 * Description : Met à jour un employé
 */
router.post('/:id/edit', employeController.update);

/**
 * Route : POST /employes/:id/delete
 * Description : Supprime un employé
 */
router.post('/:id/delete', employeController.remove);

export default router;

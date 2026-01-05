import Chambre from '../models/Chambre.js';

class ChambreController {
    // Afficher la liste des chambres
    static async index(req, res) {
        console.log(' ChambreController.index() appelé');
        try {
            const chambres = await Chambre.findAll();
            console.log(' Chambres récupérées:', chambres.length);
            res.render('Chambre/index', {
                title: 'Gestion des Chambres',
                chambres: chambres
            });
        } catch (error) {
            console.error(' Erreur index:', error.message);
            res.redirect('/');
        }
    }
    
    // Afficher le formulaire de création
    static create(req, res) {
        console.log(' ChambreController.create() appelé (GET)');
        console.log(' Tentative de rendu: Chambre/create');
        try {
            res.render('Chambre/create', {
                title: 'Ajouter une Chambre',
                chambre: {},
                errors: []
            });
            console.log(' Vue Chambre/create rendue avec succès');
        } catch (error) {
            console.error(' Erreur lors de l\'affichage du formulaire:', error);
            res.render('Chambre/create', {
                title: 'Ajouter une Chambre',
                chambre: {},
                errors: [{ msg: 'Erreur lors de l\'affichage du formulaire' }]
            });
        }
    }
    
    // Traiter la création d'une chambre
    static async store(req, res) {
        console.log(' ChambreController.store() appelé (POST)');
        console.log(' Données reçues:', req.body);
        try {
            const errors = [];
            
            // Validation
            if (!req.body.numero || req.body.numero.trim() === '') {
                console.log(' Validation échouée: numéro manquant');
                errors.push({ msg: 'Le numéro de chambre est requis' });
            }
            if (!req.body.capacite || isNaN(req.body.capacite) || parseInt(req.body.capacite) <= 0) {
                console.log(' Validation échouée: capacité invalide');
                errors.push({ msg: 'La capacité doit être un nombre positif' });
            }
            
            // Si erreurs de validation
            if (errors.length > 0) {
                console.log(' Erreurs de validation:', errors);
                return res.render('Chambre/create', {
                    title: 'Ajouter une Chambre',
                    chambre: req.body,
                    errors: errors
                });
            }
            
            // Création en base
            console.log(' Appel de Chambre.create()...');
            const newId = await Chambre.create(req.body);
            console.log(' Chambre créée avec ID:', newId);
            console.log('↪ Redirection vers /chambres');
            res.redirect('/chambres');
        } catch (error) {
            console.error(' Erreur lors de la création:', error.message);
            console.error('Stack:', error.stack);
            
            res.render('Chambre/create', {
                title: 'Ajouter une Chambre',
                chambre: req.body,
                errors: [{ msg: error.message }]
            });
        }
    }
    
    // Afficher le formulaire d'édition
    static async edit(req, res) {
        console.log(' ChambreController.edit() appelé pour ID:', req.params.id);
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!chambre) {
                console.log(' Chambre non trouvée, redirection');
                return res.redirect('/chambres');
            }
            console.log(' Chambre trouvée:', chambre);
            res.render('Chambre/edit', {
                title: 'Modifier la Chambre',
                chambre: chambre,
                errors: []
            });
        } catch (error) {
            console.error(' Erreur edit:', error.message);
            res.redirect('/chambres');
        }
    }
    
    // Traiter la mise à jour d'une chambre
    static async update(req, res) {
        console.log(' ChambreController.update() appelé pour ID:', req.params.id);
        console.log(' Données reçues:', req.body);
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!chambre) {
                console.log(' Chambre non trouvée');
                return res.redirect('/chambres');
            }
            console.log(' Mise à jour de la chambre...');
            await chambre.update(req.body);
            console.log(' Chambre mise à jour avec succès');
            res.redirect('/chambres');
        } catch (error) {
            console.error(' Erreur update:', error.message);
            res.redirect('/chambres');
        }
    }
    
    // Afficher la confirmation de suppression
    static async delete(req, res) {
        console.log(' ChambreController.delete() appelé (GET) pour ID:', req.params.id);
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!chambre) {
                console.log(' Chambre non trouvée');
                return res.redirect('/chambres');
            }
            console.log(' Chambre trouvée:', chambre);
            res.render('Chambre/delete', {
                title: 'Supprimer la Chambre',
                chambre: chambre
            });
        } catch (error) {
            console.error(' Erreur lors de la récupération de la chambre:', error.message);
            res.redirect('/chambres');
        }
    }

    // Traiter la suppression d'une chambre
    static async destroy(req, res) {
        console.log(' ChambreController.destroy() appelé (DELETE) pour ID:', req.params.id);
        try {
            await Chambre.delete(req.params.id);
            console.log(' Chambre supprimée avec succès');
            res.redirect('/chambres');
        } catch (error) {
            console.error(' Erreur lors de la suppression:', error.message);
            res.redirect('/chambres');
        }
    }
}

export default ChambreController;

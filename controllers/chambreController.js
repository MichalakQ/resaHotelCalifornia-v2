import Chambre from '../models/Chambre.js';
class ChambreController {
    // Afficher la liste des chambres
    static async index(req, res) {
        try {
            const chambres = await Chambre.findAll();
            res.render('Chambre/index', {
                title: 'Gestion des Chambres',
                Chambre: Chambre
            });
        } catch (error) {
            res.redirect('/');
        }
    }
    // Afficher le formulaire de création
    static create(req, res) {
        try {
            res.render('Chambre/create', {
                title: 'Ajouter une Chambre',
                Chambre: {},
                errors: []
            });
        } catch (error) {
            console.error('Erreur lors de l\'affichage du formulaire:', error);
            res.render('Chambre/create', {
                title: 'Ajouter une Chambre',
                Chambre: {},  // ✅ Corrigé : {} au lieu de req.body (car GET n'a pas de body)
                errors: [{ msg: 'Erreur lors de l\'affichage du formulaire' }]
            });
        }
    }
    // Traiter la création d'une chambre
    static async store(req, res) {
        try {
            console.log("creation go brrr")
            // Validation manuelle des données
            const errors = [];
            // Vérification des champs requis
            if (!req.body.numero || req.body.numero.trim() === '') {
                errors.push({ msg: 'Le numéro de chambre est requis' });
            }
            if (!req.body.type || req.body.type.trim() === '') {
                errors.push({ msg: 'Le type de chambre est requis' });
            }
            if (!req.body.prix || isNaN(req.body.prix) || parseFloat(req.body.prix) <= 0) {
                errors.push({ msg: 'Le prix doit être un nombre positif' });
            }
            // Vérification de la disponibilité (si le champ existe)
            if (req.body.disponible && !['true', 'false', '1', '0'].includes(req.body.disponible)) {
                errors.push({ msg: 'La disponibilité doit être valide' });
            }
            // Si des erreurs existent, retourner à la vue avec les erreurs
            if (errors.length > 0) {
                return res.render('Chambre/create', {
                    title: 'Ajouter une Chambre',
                    Chambre: req.body,
                    errors: errors
                });
            }
            await Chambre.create(req.body);
            res.redirect('/Chambre');
        } catch (error) {
            console.log("creation pas glop")
            console.log(error.message)
    
            res.render('Chambre/create', {
                title: 'Ajouter une Chambre',
                Chambre: req.body,
                errors: [{ msg: error.message }]
            });
        }
    }
    // Afficher le formulaire d'édition
    static async edit(req, res) {
        try {
            const Chambre = await Chambre.findById(req.params.id);
            if (!Chambre) {
                return res.redirect('/chambre');
            }
            res.render('chambre/edit', {
                title: 'Modifier la Chambre',
                Chambre: Chambre,
                errors: []
            });
        } catch (error) {
            res.redirect('/chambres');
        }
    }
    // Traiter la mise à jour d'une chambre
    static async update(req, res) {
        try {
            const Chambre = await Chambre.findById(req.params.id);
            if (!Chambre) {
                return res.redirect('/Chambre');
            }
            await Chambre.update(req.body);  // ✅ Appel d'instance
            res.redirect('/Chambre');
        } catch (error) {
            console.error('Erreur update:', error);
            res.redirect('/Chambre');
        }
    }
    // Afficher la confirmation de suppression
    static async delete(req, res) {
        try {
            const chambre = await Chambre.findById(req.params.id);
            if (!Chambre) {
                return res.redirect('/Chambre');
            }
            res.render('Chambre/delete', {
                title: 'Supprimer la Chambre',
                Chambre: Chambre
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la chambre:', error);
            res.redirect('/Chambre');
        }
    }

    // Traiter la suppression d'une chambre
    static async destroy(req, res) {
        try {
            // Utilisation de la méthode statique delete
            await Chambre.delete(req.params.id);
            res.redirect('/Chambre');
        } catch (error) {
            console.error('Erreur lors de la suppression de la chambre:', error);
            res.redirect('/Chambre');
        }
    }
}
export default ChambreController;
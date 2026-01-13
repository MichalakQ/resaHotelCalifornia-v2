import Reservation from '../models/Reservation.js';
import Client from '../models/Client.js';
import Chambre from '../models/Chambre.js';


class ReservationController {
    // Afficher la liste des réservations
    static async index(req, res) {
        console.log(' ReservationController.index() appelé');
        try {
            const reservations = await Reservation.findAll();
            console.log(' Réservations récupérées:', reservations.length);
            res.render('Reservation/index', {
                title: 'Gestion des Réservations',
                reservations: reservations
            });
        } catch (error) {
            console.error(' Erreur index:', error.message);
            res.redirect('/');
        }
    }
    
    // Afficher le formulaire de création
    static async create(req, res) {
        console.log(' ReservationController.create() appelé (GET)');
        try {
            const clients = await Client.findAll();
            const chambres = await Chambre.findAll();
    
            res.render('Reservation/create', {
                title: 'Ajouter une Réservation',
                reservation: {},
                clients,
                chambres,
                errors: []
            });
        } catch (error) {
            console.error(' Erreur lors de l\'affichage du formulaire:', error.message);
            res.render('Reservation/create', {
                title: 'Ajouter une Réservation',
                reservation: {},
                clients: [],
                chambres: [],
                errors: [{ msg: 'Erreur lors du chargement des données' }]
            });
        }
    }
    
    
    // Traiter la création d'une réservation
    static async store(req, res) {
        console.log(' ReservationController.store() appelé (POST)');
        console.log(' Données reçues:', req.body);
        try {
            const errors = [];
            
            // Validation 

            if (!req.body.client_id || isNaN(req.body.client_id) || parseInt(req.body.client_id) <= 0) {
                console.log(' Validation échouée: id de client invalide');
                errors.push({ msg: 'L\'id du client doit être un nombre positif' });
            }

            if (!req.body.chambre_id || isNaN(req.body.chambre_id) || parseInt(req.body.chambre_id) <= 0) {
                console.log(' Validation échouée: id de chambre invalide');
                errors.push({ msg: 'L\'id de la chambre doit être un nombre positif' });
            }

            if (!req.body.date_arrivee) {
                console.log(' Validation échouée: Date d\'arrivée invalide');
                errors.push({ msg: 'La date d\'arrivée doit être définie' });
            }

            if (!req.body.date_depart) {
                console.log(' Validation échouée: Date de départ invalide');
                errors.push({ msg: 'La date de départ doit être définie' });
            }

            
            // Si erreurs de validation
            if (errors.length > 0) {
                console.log(' Erreurs de validation:', errors);
                return res.render('Reservation/create', {
                    title: 'Ajouter une Réservation',
                    reservation: req.body,
                    errors: errors
                });
            }
            
            // Création en base
            console.log(' Appel de Reservation.create()...');
            const newId = await Reservation.create(req.body);
            console.log(' Reservation créée avec ID:', newId);
            console.log('↪ Redirection vers /reservations');
            res.redirect('/reservations');
        } catch (error) {
            console.error(' Erreur lors de la création:', error.message);
            console.error('Stack:', error.stack);
            
            res.render('Reservation/create', {
                title: 'Ajouter une Réservation',
                reservation: req.body,
                errors: [{ msg: error.message }]
            });
        }
    }
    
    // Afficher le formulaire d'édition
    static async edit(req, res) {
        try {
            const reservation = await Reservation.findById(req.params.id);
            if (!reservation) {
                return res.redirect('/reservations');
            }
    
            const clients = await Client.findAll();
            const chambres = await Chambre.findAll();
    
            res.render('Reservation/edit', {
                title: 'Modifier la Réservation',
                reservation,
                clients,
                chambres,
                errors: []
            });
        } catch (error) {
            res.redirect('/reservations');
        }
    }
    
    // Traiter la mise à jour d'une réservation
    static async update(req, res) {
        console.log(' ReservationController.update() appelé pour ID:', req.params.id);
        console.log(' Données reçues:', req.body);
        try {
            const reservation = await Reservation.findById(req.params.id);
            if (!reservation) {
                console.log(' Reservation non trouvée');
                return res.redirect('/reservations');
            }
            console.log(' Mise à jour de la réservation...');
            await reservation.update(req.body);
            console.log(' Reservation mise à jour avec succès');
            res.redirect('/reservations');
        } catch (error) {
            console.error(' Erreur update:', error.message);
            res.redirect('/reservations');
        }
    }
    
    // Afficher la confirmation de suppression
    static async delete(req, res) {
        console.log(' ReservationController.delete() appelé (GET) pour ID:', req.params.id);
        try {
            const reservation = await Reservation.findById(req.params.id);
            if (!reservation) {
                console.log(' Reservation non trouvée');
                return res.redirect('/reservations');
            }
            console.log(' Reservation trouvée:', reservation);
            res.render('Reservation/delete', {
                title: 'Supprimer la Reservation',
                reservation: reservation
            });
        } catch (error) {
            console.error(' Erreur lors de la récupération de la reservation:', error.message);
            res.redirect('/reservations');
        }
    }

    // Traiter la suppression d'une réservation
    static async destroy(req, res) {
        console.log(' ReservationController.destroy() appelé (DELETE) pour ID:', req.params.id);
        try {
            await Reservation.delete(req.params.id);
            console.log(' Reservation supprimée avec succès');
            res.redirect('/reservations');
        } catch (error) {
            console.error(' Erreur lors de la suppression:', error.message);
            res.redirect('/reservations');
        }
    }
}

export default ReservationController;

import Chambre from '../models/Chambre';
class ChambreController {
// Afficher la liste des chambres
static async index(req, res) {
try {
const chambres = await Chambre.findAll();
res.render('chambres/index', {
title: 'Gestion des Chambres',
chambres: chambres
});
} catch (error) {
res.redirect('/');
}
}
// Afficher le formulaire de création
static create(req, res) {
res.render('chambres/create', {
title: 'Ajouter une Chambre',
chambre: {},
errors: []
});
}
// Traiter la création d'une chambre
static async store(req, res) {
try {
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
return res.render('chambres/create', {
title: 'Ajouter une Chambre',
chambre: req.body,
errors: errors
});
}
await Chambre.create(req.body);
res.redirect('/chambres');
} catch (error) {
res.render('chambres/create', {
title: 'Ajouter une Chambre',
chambre: req.body,
errors: [{ msg: error.message }]
});
}
}
// Afficher le formulaire d'édition
static async edit(req, res) {
try {
const chambre = await Chambre.findById(req.params.id);
if (!chambre) {
return res.redirect('/chambres');
}
res.render('chambres/edit', {
title: 'Modifier la Chambre',
chambre: chambre,
errors: []
});
} catch (error) {
res.redirect('/chambres');
}
}
// Traiter la mise à jour d'une chambre
static async update(req, res) {
try {
const uneChambre = await Chambre.findById(req.params.id);
if (uneChambre) {
await Chambre.update(req.body);
}
res.redirect('/chambres');
} catch (error) {
res.redirect('/chambres');
}
}
// Afficher la confirmation de suppression
static async delete(req, res) {
try {
const chambre = await Chambre.findById(req.params.id);
if (!chambre) {
return res.redirect('/chambres');
}
res.render('chambres/delete', {
title: 'Supprimer la Chambre',
chambre: chambre
});
} catch (error) {
res.redirect('/chambres');
}
}
// Traiter la suppression d'une chambre
static async destroy(req, res) {
try {
const chambre = await Chambre.findById(req.params.id);
if (!chambre) {
return res.redirect('/chambres');
}
await chambre.delete(req.params.id);
res.redirect('/chambres');
} catch (error) {req.session.messages = [{ type: 'error', text: error.message }];
res.redirect('/chambres');
}
}
}
module.exports = ChambreController;
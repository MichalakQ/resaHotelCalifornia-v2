const Chambre = require('../models/Employe');

module.exports = {
  // Liste
  async index(req, res) {
    const employe= await Employe.getAll();
    res.render('employe/index', { employe });
  },

  // Formulaire de création
  createForm(req, res) {
    res.render('employe/create');
  },

  // Création
  async create(req, res) {
    const { nom, email, telephone, nombre_personnes } = req.body;
    await Client.create({ nom, email, telephone, nombre_personnes });
    res.redirect('/employe');
  },

  // Formulaire d’édition
  async editForm(req, res) {
    const employe = await Employe.getById(req.params.id);
    res.render('employe/edit', { employe });
  },

  // Modification
  async update(req, res) {
    const {nom, email, telephone, nombre_personnes} = req.body;
    await Client.update(req.params.id, {nom, email, telephone, nombre_personnes});
    res.redirect('/employe');
  },

  // Suppression
  async remove(req, res) {
    await Client.remove(req.params.id);
    res.redirect('/employe');
  }
};

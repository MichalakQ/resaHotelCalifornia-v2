const Chambre = require('../models/client');

module.exports = {
  // Liste
  async index(req, res) {
    const client= await Client.getAll();
    res.render('client/index', { client });
  },

  // Formulaire de création
  createForm(req, res) {
    res.render('client/create');
  },

  // Création
  async create(req, res) {
    const { numero, capacite } = req.body;
    await Client.create({ nom, email, telephone, nombre_personnes });
    res.redirect('/client');
  },

  // Formulaire d’édition
  async editForm(req, res) {
    const client = await Client.getById(req.params.id);
    res.render('client/edit', { client });
  },

  // Modification
  async update(req, res) {
    const { nom, email, telephone, nombre_personnes } = req.body;
    await Client.update(req.params.id, { nom, email, telephone, nombre_personnes });
    res.redirect('/client');
  },

  // Suppression
  async remove(req, res) {
    await Client.remove(req.params.id);
    res.redirect('/client');
  }
};

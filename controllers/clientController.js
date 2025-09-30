const Chambre = require('../models/Client');

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
    await Client.create({ numero, capacite });
    res.redirect('/client');
  },

  // Formulaire d’édition
  async editForm(req, res) {
    const client = await Client.getById(req.params.id);
    res.render('client/edit', { chambre });
  },

  // Modification
  async update(req, res) {
    const { numero, capacite } = req.body;
    await Client.update(req.params.id, { numero, capacite });
    res.redirect('/client');
  },

  // Suppression
  async remove(req, res) {
    await Client.remove(req.params.id);
    res.redirect('/client');
  }
};

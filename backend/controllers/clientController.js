// controllers/clientController.js (ESM)
import Client from '../models/Client.js'; // ensure exact case + .js

const clientController = {
  // Liste
  async index(req, res, next) {
    try {
      const clients = await Client.findAll();
      res.render('client/index', { clients });
    } catch (err) {
      next(err);
    }
  },

  // Formulaire de création
  createForm(req, res) {
    res.render('client/create');
  },

  // Création
  async create(req, res, next) {
    try {
      const { nom, email, telephone, nombre_personnes } = req.body;
      await Client.create({ nom, email, telephone, nombre_personnes });
      res.redirect('/client');
    } catch (err) {
      next(err);
    }
  },

  // Formulaire d’édition
  async editForm(req, res, next) {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) return res.status(404).render('errors/404');
      res.render('client/edit', { client });
    } catch (err) {
      next(err);
    }
  },

  // Modification
  async update(req, res, next) {
    try {
      const { nom, email, telephone, nombre_personnes } = req.body;
      const client = await Client.findById(req.params.id);
      if (!client) return res.status(404).render('errors/404');
      await client.update({ nom, email, telephone, nombre_personnes });
      
      if (!count) return res.status(404).render('errors/404');
      res.redirect('/client');
    } catch (err) {
      next(err);
    }
  },

  // Suppression
  async remove(req, res, next) {
    try {
      await Client.delete(req.params.id);
      if (!count) return res.status(404).render('errors/404');
      res.redirect('/client');
    } catch (err) {
      next(err);
    }
  }
};

export default clientController;
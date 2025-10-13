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
      const client = await Client.findByPk(req.params.id);
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
      const [count] = await Client.update(
        { nom, email, telephone, nombre_personnes },
        { where: { id: req.params.id } }
      );
      if (!count) return res.status(404).render('errors/404');
      res.redirect('/client');
    } catch (err) {
      next(err);
    }
  },

  // Suppression
  async remove(req, res, next) {
    try {
      const count = await Client.destroy({ where: { id: req.params.id } });
      if (!count) return res.status(404).render('errors/404');
      res.redirect('/client');
    } catch (err) {
      next(err);
    }
  }
};

export default clientController;

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
    res.render('client/create', { 
      title: 'Créer un client',
      errors: [] 
    });
  },

  // Création
  async create(req, res, next) {
    try {
      const { nom, email, telephone, nombre_personnes } = req.body;
      
      // Validation basique
      const errors = [];
      if (!nom || nom.trim() === '') {
        errors.push({ msg: 'Le nom est requis' });
      }
      if (!email || email.trim() === '') {
        errors.push({ msg: 'L\'email est requis' });
      }
      
      if (errors.length > 0) {
        return res.render('client/create', { 
          title: 'Créer un client',
          errors 
        });
      }
      
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
      res.redirect('/client');
    } catch (err) {
      next(err);
    }
  },

  // Suppression
  async remove(req, res, next) {
    try {
      const count = await Client.delete(req.params.id);  // ✅ Récupérer le count
      if (!count) return res.status(404).render('errors/404');
      res.redirect('/client');
    } catch (err) {
      next(err);
    }
  }
};

export default clientController;

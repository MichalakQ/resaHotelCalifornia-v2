import Employe from '../models/employe.js';

export default  {
  // Liste
  async index(req, res) {
    const employes = await Employe.findAll();
    res.render('employe/index', { employe });
  },

  // Formulaire de création
  createForm(req, res) {
    res.render('employe/create');
  },

  // Création
  async create(req, res) {
    const {nom, age,date_recrutement, autorisation} = req.body;
    await Employe.create({ nom, age, date_recrutement, autorisation });
    res.redirect('/employe');
  },

  // Formulaire d’édition
  async editForm(req, res) {
    const employe = await Employe.findById(req.params.id);
    res.render('employe/edit', { employe });
  },

  // Modification
  async update(req, res) {
    const {nom, age,date_recrutement, autorisation} = req.body;
    await Employe.update(req.params.id, {nom, age, date_recrutement, autorisation });
    res.redirect('/employe');
  },

  // Suppression
  async remove(req, res) {
    await Employe.delete(req.params.id);
    res.redirect('/employe');
  }
};
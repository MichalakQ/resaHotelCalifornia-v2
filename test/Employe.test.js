import employeController from '../controllers/employeController.js';
import Employe from '../models/employe.js';

jest.mock('../models/employe.js');

describe('employeController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn()
    };

    jest.clearAllMocks();
  });

  // =====================
  // index
  // =====================
  describe('index', () => {
    it('doit afficher la liste des employés', async () => {
      const employes = [{ id: 1, nom: 'Alice' }];
      Employe.findAll.mockResolvedValue(employes);

      await employeController.index(req, res);

      expect(Employe.findAll).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('employe/index', {
        employes
      });
    });
  });

  // =====================
  // createForm
  // =====================
  describe('createForm', () => {
    it('doit afficher le formulaire de création', () => {
      employeController.createForm(req, res);

      expect(res.render).toHaveBeenCalledWith('employe/create');
    });
  });

  // =====================
  // create
  // =====================
  describe('create', () => {
    it('doit créer un employé et rediriger', async () => {
      req.body = {
        nom: 'Bob',
        age: 30,
        date_recrutement: '2024-01-01',
        autorisation: true
      };

      await employeController.create(req, res);

      expect(Employe.create).toHaveBeenCalledWith(req.body);
      expect(res.redirect).toHaveBeenCalledWith('/employe');
    });
  });

  // =====================
  // editForm
  // =====================
  describe('editForm', () => {
    it('doit afficher le formulaire d’édition', async () => {
      const employe = { id: 1, nom: 'Alice' };
      req.params.id = 1;
      Employe.findById.mockResolvedValue(employe);

      await employeController.editForm(req, res);

      expect(Employe.findById).toHaveBeenCalledWith(1);
      expect(res.render).toHaveBeenCalledWith('employe/edit', {
        employe
      });
    });
  });

  // =====================
  // update
  // =====================
  describe('update', () => {
    it('doit mettre à jour un employé et rediriger', async () => {
      req.params.id = 1;
      req.body = {
        nom: 'Charlie',
        age: 35,
        date_recrutement: '2023-01-01',
        autorisation: false
      };

      await employeController.update(req, res);

      expect(Employe.update).toHaveBeenCalledWith(1, req.body);
      expect(res.redirect).toHaveBeenCalledWith('/employe');
    });
  });

  // =====================
  // remove
  // =====================
  describe('remove', () => {
    it('doit supprimer un employé et rediriger', async () => {
      req.params.id = 1;

      await employeController.remove(req, res);

      expect(Employe.delete).toHaveBeenCalledWith(1);
      expect(res.redirect).toHaveBeenCalledWith('/employe');
    });
  });
});
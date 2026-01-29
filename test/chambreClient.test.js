import clientController from '../controllers/clientController.js';
import Client from '../models/Client.js';

// Jest utilisera automatiquement __mocks__/Client.js
jest.mock('../models/Client.js');

describe('clientController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // =====================
  // index
  // =====================
  describe('index', () => {
    it('doit afficher la liste des clients', async () => {
      const clients = [{ id: 1, nom: 'Jean' }];
      Client.findAll.mockResolvedValue(clients);

      await clientController.index(req, res, next);

      expect(Client.findAll).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('client/index', { clients });
    });

    it('doit appeler next en cas d’erreur', async () => {
      const error = new Error('DB error');
      Client.findAll.mockRejectedValue(error);

      await clientController.index(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // =====================
  // createForm
  // =====================
  describe('createForm', () => {
    it('doit afficher le formulaire de création', () => {
      clientController.createForm(req, res);

      expect(res.render).toHaveBeenCalledWith('client/create', {
        title: 'Créer un client',
        errors: []
      });
    });
  });

  // =====================
  // create
  // =====================
  describe('create', () => {
    it('doit afficher les erreurs si nom ou email manquant', async () => {
      req.body = { nom: '', email: '' };

      await clientController.create(req, res, next);

      expect(res.render).toHaveBeenCalledWith(
        'client/create',
        expect.objectContaining({
          title: 'Créer un client',
          errors: expect.any(Array)
        })
      );
      expect(Client.create).not.toHaveBeenCalled();
    });

    it('doit créer un client et rediriger', async () => {
      req.body = {
        nom: 'Jean',
        email: 'jean@test.com',
        telephone: '0600000000',
        nombre_personnes: 2
      };

      Client.create.mockResolvedValue({});

      await clientController.create(req, res, next);

      expect(Client.create).toHaveBeenCalledWith(req.body);
      expect(res.redirect).toHaveBeenCalledWith('/client');
    });
  });

  // =====================
  // editForm
  // =====================
  describe('editForm', () => {
    it('doit afficher le formulaire d’édition', async () => {
      const client = { id: 1, nom: 'Jean' };
      req.params.id = 1;
      Client.findById.mockResolvedValue(client);

      await clientController.editForm(req, res, next);

      expect(res.render).toHaveBeenCalledWith('client/edit', {
        client,
        errors: []
      });
    });

    it('doit retourner une 404 si client introuvable', async () => {
      req.params.id = 1;
      Client.findById.mockResolvedValue(null);

      await clientController.editForm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('errors/404');
    });
  });

  // =====================
  // update
  // =====================
  describe('update', () => {
    it('doit mettre à jour un client et rediriger', async () => {
      const client = {
        update: jest.fn()
      };

      req.params.id = 1;
      req.body = { nom: 'Paul' };
      Client.findById.mockResolvedValue(client);

      await clientController.update(req, res, next);

      expect(client.update).toHaveBeenCalledWith(req.body);
      expect(res.redirect).toHaveBeenCalledWith('/client');
    });
  });

  // =====================
  // remove
  // =====================
  describe('remove', () => {
    it('doit supprimer un client et rediriger', async () => {
      req.params.id = 1;
      Client.delete.mockResolvedValue();

      await clientController.remove(req, res, next);

      expect(Client.delete).toHaveBeenCalledWith(1);
      expect(res.redirect).toHaveBeenCalledWith('/client');
    });
  });
});
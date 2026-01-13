// tests/controllers/clientController.test.js
import clientController from '../../controllers/clientController.js';
import Client from '../../models/Client.js';

// Mock du modèle Client
jest.mock('../../models/Client.js');

describe('clientController', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset des mocks avant chaque test
    jest.clearAllMocks();
    
    // Configuration des objets req, res, next
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
  });

  describe('index', () => {
    it('devrait récupérer tous les clients et les afficher', async () => {
      const mockClients = [
        { id: 1, nom: 'Dupont', email: 'dupont@test.com' },
        { id: 2, nom: 'Martin', email: 'martin@test.com' }
      ];
      
      Client.findAll.mockResolvedValue(mockClients);

      await clientController.index(req, res, next);

      expect(Client.findAll).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith('client/index', { clients: mockClients });
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait appeler next avec une erreur en cas de problème', async () => {
      const error = new Error('Erreur DB');
      Client.findAll.mockRejectedValue(error);

      await clientController.index(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe('createForm', () => {
    it('devrait afficher le formulaire de création', () => {
      clientController.createForm(req, res);

      expect(res.render).toHaveBeenCalledWith('client/create');
    });
  });

  describe('create', () => {
    it('devrait créer un client et rediriger', async () => {
      req.body = {
        nom: 'Nouveau Client',
        email: 'nouveau@test.com',
        telephone: '0123456789',
        nombre_personnes: 4
      };

      Client.create.mockResolvedValue({ id: 1, ...req.body });

      await clientController.create(req, res, next);

      expect(Client.create).toHaveBeenCalledWith({
        nom: 'Nouveau Client',
        email: 'nouveau@test.com',
        telephone: '0123456789',
        nombre_personnes: 4
      });
      expect(res.redirect).toHaveBeenCalledWith('/client');
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de création', async () => {
      const error = new Error('Erreur de validation');
      req.body = { nom: 'Test' };
      Client.create.mockRejectedValue(error);

      await clientController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });

  describe('editForm', () => {
    it('devrait afficher le formulaire d\'édition avec le client', async () => {
      const mockClient = { id: 1, nom: 'Client Test', email: 'test@test.com' };
      req.params.id = '1';
      Client.findById.mockResolvedValue(mockClient);

      await clientController.editForm(req, res, next);

      expect(Client.findById).toHaveBeenCalledWith('1');
      expect(res.render).toHaveBeenCalledWith('client/edit', { client: mockClient });
      expect(next).not.toHaveBeenCalled();
    });

    it('devrait retourner 404 si le client n\'existe pas', async () => {
      req.params.id = '999';
      Client.findById.mockResolvedValue(null);

      await clientController.editForm(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('errors/404');
    });

    it('devrait gérer les erreurs', async () => {
      const error = new Error('Erreur DB');
      req.params.id = '1';
      Client.findById.mockRejectedValue(error);

      await clientController.editForm(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un client et rediriger', async () => {
      req.params.id = '1';
      req.body = {
        nom: 'Client Modifié',
        email: 'modifie@test.com',
        telephone: '0987654321',
        nombre_personnes: 2
      };

      const mockClient = {
        id: 1,
        nom: 'Client Original',
        update: jest.fn().mockResolvedValue(true)
      };

      Client.findById.mockResolvedValue(mockClient);

      await clientController.update(req, res, next);

      expect(Client.findById).toHaveBeenCalledWith('1');
      expect(mockClient.update).toHaveBeenCalledWith({
        nom: 'Client Modifié',
        email: 'modifie@test.com',
        telephone: '0987654321',
        nombre_personnes: 2
      });
      expect(res.redirect).toHaveBeenCalledWith('/client');
    });

    it('devrait retourner 404 si le client n\'existe pas', async () => {
      req.params.id = '999';
      req.body = { nom: 'Test' };
      Client.findById.mockResolvedValue(null);

      await clientController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith('errors/404');
    });

    it('devrait gérer les erreurs de mise à jour', async () => {
      const error = new Error('Erreur de mise à jour');
      req.params.id = '1';
      req.body = { nom: 'Test' };
      
      const mockClient = {
        update: jest.fn().mockRejectedValue(error)
      };
      
      Client.findById.mockResolvedValue(mockClient);

      await clientController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('remove', () => {
    it('devrait supprimer un client et rediriger', async () => {
      req.params.id = '1';
      Client.delete.mockResolvedValue(1);

      await clientController.remove(req, res, next);

      expect(Client.delete).toHaveBeenCalledWith('1');
      expect(res.redirect).toHaveBeenCalledWith('/client');
    });

    it('devrait gérer les erreurs de suppression', async () => {
      const error = new Error('Erreur de suppression');
      req.params.id = '1';
      Client.delete.mockRejectedValue(error);

      await clientController.remove(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });
  });
});
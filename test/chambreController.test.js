import Chambre from '../Chambre.js';
import db from '../connexion.js';

jest.mock('../connexion.js');

describe('Chambre model', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('doit créer une instance de Chambre', () => {
      const data = { id: 1, numero: '101', capacite: 2 };
      const chambre = new Chambre(data);

      expect(chambre.id).toBe(1);
      expect(chambre.numero).toBe('101');
      expect(chambre.capacite).toBe(2);
    });
  });

  describe('findAll', () => {
    it('doit retourner toutes les chambres', async () => {
      db.execute.mockResolvedValue([
        [
          { id: 1, numero: '101', capacite: 2 },
          { id: 2, numero: '102', capacite: 3 }
        ]
      ]);

      const chambres = await Chambre.findAll();

      expect(db.execute).toHaveBeenCalledWith(
        'SELECT * FROM chambres ORDER BY numero'
      );
      expect(chambres).toHaveLength(2);
      expect(chambres[0]).toBeInstanceOf(Chambre);
    });

    it('doit lever une erreur en cas de problème DB', async () => {
      db.execute.mockRejectedValue(new Error('DB error'));

      await expect(Chambre.findAll())
        .rejects
        .toThrow('Erreur lors de la récupération des chambres');
    });
  });

  describe('findById', () => {
    it('doit retourner une chambre si trouvée', async () => {
      db.execute.mockResolvedValue([
        [{ id: 1, numero: '101', capacite: 2 }]
      ]);

      const chambre = await Chambre.findById(1);

      expect(db.execute).toHaveBeenCalledWith(
        'SELECT * FROM chambres WHERE id = ?',
        [1]
      );
      expect(chambre).toBeInstanceOf(Chambre);
      expect(chambre.id).toBe(1);
    });

    it('doit retourner null si non trouvée', async () => {
      db.execute.mockResolvedValue([[]]);

      const chambre = await Chambre.findById(999);

      expect(chambre).toBeNull();
    });
  });

  describe('create', () => {
    it('doit créer une chambre et retourner son ID', async () => {
      db.execute.mockResolvedValue([{ insertId: 5 }]);

      const id = await Chambre.create({
        numero: '103',
        capacite: 2,
        disponible: true
      });

      expect(db.execute).toHaveBeenCalled();
      expect(id).toBe(5);
    });

    it('doit gérer une chambre déjà existante', async () => {
      db.execute.mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(
        Chambre.create({ numero: '101', capacite: 2 })
      ).rejects.toThrow('Cette chambre existe déjà');
    });
  });

  describe('update', () => {
    it('doit mettre à jour une chambre', async () => {
      const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });
      db.execute.mockResolvedValue([]);

      const result = await chambre.update({ capacite: 3 });

      expect(db.execute).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(chambre.capacite).toBe(3);
    });

    it('doit refuser une update vide', async () => {
      const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });

      await expect(chambre.update({}))
        .rejects
        .toThrow('Aucune donnée à mettre à jour');
    });
  });

  describe('delete', () => {
    it('doit supprimer une chambre sans réservations', async () => {
      db.execute
        .mockResolvedValueOnce([[{ count: 0 }]])
        .mockResolvedValueOnce([]);

      const result = await Chambre.delete(1);

      expect(result).toBe(true);
      expect(db.execute).toHaveBeenCalledTimes(2);
    });

    it('doit refuser la suppression si réservations existantes', async () => {
      db.execute.mockResolvedValueOnce([[{ count: 2 }]]);

      await expect(Chambre.delete(1))
        .rejects
        .toThrow('Impossible de supprimer la chambre');
    });
  });

  describe('isAvailable', () => {
    it('doit retourner true si disponible', async () => {
      db.execute.mockResolvedValue([[{ count: 0 }]]);

      const available = await Chambre.isAvailable(1, '2024-01-01', '2024-01-05');

      expect(available).toBe(true);
    });

    it('doit retourner false si non disponible', async () => {
      db.execute.mockResolvedValue([[{ count: 1 }]]);

      const available = await Chambre.isAvailable(1, '2024-01-01', '2024-01-05');

      expect(available).toBe(false);
    });
  });

  describe('findAvailable', () => {
    it('doit retourner les chambres disponibles', async () => {
      db.execute.mockResolvedValue([
        [{ id: 1, numero: '101', capacite: 2 }]
      ]);

      const chambres = await Chambre.findAvailable(
        '2024-01-01',
        '2024-01-05',
        2
      );

      expect(chambres).toHaveLength(1);
      expect(chambres[0]).toBeInstanceOf(Chambre);
    });
  });

  describe('getReservations', () => {
    it('doit retourner les réservations d’une chambre', async () => {
      db.execute.mockResolvedValue([
        [{ id: 1, client_nom: 'Doe', client_email: 'test@test.com' }]
      ]);

      const reservations = await Chambre.getReservations(1);

      expect(reservations).toHaveLength(1);
      expect(reservations[0].client_nom).toBe('Doe');
    });
  });
});

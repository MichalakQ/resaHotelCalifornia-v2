import Chambre from './Chambre.js';
import db from './connexion.js';

// Mock du module de connexion à la base de données
jest.mock('./connexion.js');

// Mock de console.log pour éviter les logs pendant les tests
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};

describe('Chambre', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('devrait créer une instance Chambre avec les propriétés obligatoires', () => {
            const data = {
                id: 1,
                numero: '101',
                capacite: 2
            };
            const chambre = new Chambre(data);

            expect(chambre.id).toBe(1);
            expect(chambre.numero).toBe('101');
            expect(chambre.capacite).toBe(2);
        });

        it('devrait créer une instance Chambre avec toutes les propriétés', () => {
            const data = {
                id: 1,
                numero: '101',
                capacite: 2,
                type: 'Double',
                prix: 150,
                disponible: true
            };
            const chambre = new Chambre(data);

            expect(chambre.id).toBe(1);
            expect(chambre.numero).toBe('101');
            expect(chambre.capacite).toBe(2);
        });
    });

    describe('findAll', () => {
        it('devrait retourner toutes les chambres', async () => {
            const mockRows = [
                { id: 1, numero: '101', capacite: 2 },
                { id: 2, numero: '102', capacite: 4 }
            ];
            db.execute.mockResolvedValue([mockRows]);

            const chambres = await Chambre.findAll();

            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM chambres ORDER BY numero');
            expect(chambres).toHaveLength(2);
            expect(chambres[0]).toBeInstanceOf(Chambre);
            expect(chambres[0].numero).toBe('101');
            expect(chambres[1].numero).toBe('102');
        });

        it('devrait retourner un tableau vide si aucune chambre', async () => {
            db.execute.mockResolvedValue([[]]);

            const chambres = await Chambre.findAll();

            expect(chambres).toHaveLength(0);
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Chambre.findAll()).rejects.toThrow('Erreur lors de la récupération des chambres: Erreur DB');
        });
    });

    describe('findById', () => {
        it('devrait retourner une chambre par son ID', async () => {
            const mockRow = { id: 1, numero: '101', capacite: 2 };
            db.execute.mockResolvedValue([[mockRow]]);

            const chambre = await Chambre.findById(1);

            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM chambres WHERE id = ?', [1]);
            expect(chambre).toBeInstanceOf(Chambre);
            expect(chambre.numero).toBe('101');
        });

        it('devrait retourner null si la chambre n\'existe pas', async () => {
            db.execute.mockResolvedValue([[]]);

            const chambre = await Chambre.findById(999);

            expect(chambre).toBeNull();
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Chambre.findById(1)).rejects.toThrow('Erreur lors de la récupération de la chambre: Erreur DB');
        });
    });

    describe('create', () => {
        it('devrait créer une nouvelle chambre avec champs obligatoires seulement', async () => {
            const chambreData = {
                numero: '101',
                capacite: 2
            };
            db.execute.mockResolvedValue([{ insertId: 1 }]);

            const insertId = await Chambre.create(chambreData);

            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO chambres (numero, capacite) VALUES (?, ?)',
                ['101', 2]
            );
            expect(insertId).toBe(1);
        });

        it('devrait créer une nouvelle chambre avec tous les champs optionnels', async () => {
            const chambreData = {
                numero: '101',
                capacite: 2,
                type: 'Double',
                prix: 150,
                disponible: true
            };
            db.execute.mockResolvedValue([{ insertId: 1 }]);

            const insertId = await Chambre.create(chambreData);

            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO chambres (numero, capacite, type, prix, disponible) VALUES (?, ?, ?, ?, ?)',
                ['101', 2, 'Double', 150, 1]
            );
            expect(insertId).toBe(1);
        });

        it('devrait convertir disponible en 0 si false', async () => {
            const chambreData = {
                numero: '101',
                capacite: 2,
                disponible: false
            };
            db.execute.mockResolvedValue([{ insertId: 1 }]);

            await Chambre.create(chambreData);

            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO chambres (numero, capacite, disponible) VALUES (?, ?, ?)',
                ['101', 2, 0]
            );
        });

        it('devrait lancer une erreur si la chambre existe déjà', async () => {
            const chambreData = {
                numero: '101',
                capacite: 2
            };
            const error = new Error('Duplicate entry');
            error.code = 'ER_DUP_ENTRY';
            db.execute.mockRejectedValue(error);

            await expect(Chambre.create(chambreData)).rejects.toThrow('Cette chambre existe déjà');
        });

        it('devrait lancer une erreur si un champ n\'existe pas dans la table', async () => {
            const chambreData = {
                numero: '101',
                capacite: 2,
                type: 'Double'
            };
            const error = new Error('Unknown column');
            error.code = 'ER_BAD_FIELD_ERROR';
            db.execute.mockRejectedValue(error);

            await expect(Chambre.create(chambreData)).rejects.toThrow(
                'Erreur: un champ n\'existe pas dans la table. Vérifiez que vous avez modifié le SQL pour ajouter les colonnes type, prix et disponible.'
            );
        });

        it('devrait lancer une erreur générique pour d\'autres erreurs', async () => {
            const chambreData = {
                numero: '101',
                capacite: 2
            };
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Chambre.create(chambreData)).rejects.toThrow('Erreur lors de la création de la chambre: Erreur DB');
        });
    });

    describe('update', () => {
        it('devrait mettre à jour une chambre avec un champ', async () => {
            const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });
            const chambreData = { numero: '102' };
            db.execute.mockResolvedValue([{}]);

            const result = await chambre.update(chambreData);

            expect(db.execute).toHaveBeenCalledWith(
                'UPDATE chambres SET numero = ? WHERE id = ?',
                ['102', 1]
            );
            expect(result).toBe(true);
            expect(chambre.numero).toBe('102');
        });

        it('devrait mettre à jour une chambre avec plusieurs champs', async () => {
            const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });
            const chambreData = {
                numero: '102',
                capacite: 4,
                type: 'Suite',
                prix: 250,
                disponible: false
            };
            db.execute.mockResolvedValue([{}]);

            const result = await chambre.update(chambreData);

            expect(db.execute).toHaveBeenCalledWith(
                'UPDATE chambres SET numero = ?, capacite = ?, type = ?, prix = ?, disponible = ? WHERE id = ?',
                ['102', 4, 'Suite', 250, 0, 1]
            );
            expect(result).toBe(true);
            expect(chambre.numero).toBe('102');
            expect(chambre.capacite).toBe(4);
            expect(chambre.type).toBe('Suite');
            expect(chambre.prix).toBe(250);
            expect(chambre.disponible).toBe(false);
        });

        it('devrait lancer une erreur si aucune donnée à mettre à jour', async () => {
            const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });
            const chambreData = {};

            await expect(chambre.update(chambreData)).rejects.toThrow('Aucune donnée à mettre à jour');
        });

        it('devrait lancer une erreur si la chambre existe déjà (doublon)', async () => {
            const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });
            const chambreData = { numero: '102' };
            const error = new Error('Duplicate entry');
            error.code = 'ER_DUP_ENTRY';
            db.execute.mockRejectedValue(error);

            await expect(chambre.update(chambreData)).rejects.toThrow('Cette chambre existe déjà');
        });

        it('devrait lancer une erreur si un champ n\'existe pas', async () => {
            const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });
            const chambreData = { type: 'Double' };
            const error = new Error('Unknown column');
            error.code = 'ER_BAD_FIELD_ERROR';
            db.execute.mockRejectedValue(error);

            await expect(chambre.update(chambreData)).rejects.toThrow(
                'Erreur: un champ n\'existe pas dans la table. Vérifiez que vous avez modifié le SQL pour ajouter les colonnes type, prix et disponible.'
            );
        });

        it('devrait lancer une erreur générique pour d\'autres erreurs', async () => {
            const chambre = new Chambre({ id: 1, numero: '101', capacite: 2 });
            const chambreData = { numero: '102' };
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(chambre.update(chambreData)).rejects.toThrow('Erreur lors de la mise à jour de la chambre: Erreur DB');
        });
    });

    describe('delete', () => {
        it('devrait supprimer une chambre sans réservations', async () => {
            db.execute
                .mockResolvedValueOnce([[{ count: 0 }]]) // Aucune réservation
                .mockResolvedValueOnce([{}]); // Suppression réussie

            const result = await Chambre.delete(1);

            expect(db.execute).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM reservations WHERE chambre_id = ?',
                [1]
            );
            expect(db.execute).toHaveBeenCalledWith('DELETE FROM chambres WHERE id = ?', [1]);
            expect(result).toBe(true);
        });

        it('devrait lancer une erreur si la chambre a des réservations', async () => {
            db.execute.mockResolvedValue([[{ count: 2 }]]);

            await expect(Chambre.delete(1)).rejects.toThrow(
                'Erreur lors de la suppression de la chambre: Impossible de supprimer la chambre : des réservations sont associées'
            );
            expect(db.execute).toHaveBeenCalledTimes(1);
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Chambre.delete(1)).rejects.toThrow('Erreur lors de la suppression de la chambre: Erreur DB');
        });
    });

    describe('isAvailable', () => {
        it('devrait retourner true si la chambre est disponible', async () => {
            db.execute.mockResolvedValue([[{ count: 0 }]]);

            const available = await Chambre.isAvailable(1, '2024-01-01', '2024-01-05');

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('SELECT COUNT(*) as count'),
                [1, '2024-01-01', '2024-01-01', '2024-01-05', '2024-01-05', '2024-01-01', '2024-01-05']
            );
            expect(available).toBe(true);
        });

        it('devrait retourner false si la chambre n\'est pas disponible', async () => {
            db.execute.mockResolvedValue([[{ count: 1 }]]);

            const available = await Chambre.isAvailable(1, '2024-01-01', '2024-01-05');

            expect(available).toBe(false);
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Chambre.isAvailable(1, '2024-01-01', '2024-01-05')).rejects.toThrow(
                "Erreur lors de la vérification de la disponibilité de la chambre: Erreur DB"
            );
        });
    });

    describe('findAvailable', () => {
        it('devrait retourner les chambres disponibles sans filtre de capacité', async () => {
            const mockRows = [
                { id: 1, numero: '101', capacite: 2 },
                { id: 2, numero: '102', capacite: 4 }
            ];
            db.execute.mockResolvedValue([mockRows]);

            const chambres = await Chambre.findAvailable('2024-01-01', '2024-01-05');

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('WHERE c.id NOT IN'),
                ['2024-01-01', '2024-01-01', '2024-01-05', '2024-01-05', '2024-01-01', '2024-01-05']
            );
            expect(chambres).toHaveLength(2);
            expect(chambres[0]).toBeInstanceOf(Chambre);
        });

        it('devrait retourner les chambres disponibles avec filtre de capacité', async () => {
            const mockRows = [
                { id: 2, numero: '102', capacite: 4 }
            ];
            db.execute.mockResolvedValue([mockRows]);

            const chambres = await Chambre.findAvailable('2024-01-01', '2024-01-05', 4);

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('AND c.capacite >= ?'),
                ['2024-01-01', '2024-01-01', '2024-01-05', '2024-01-05', '2024-01-01', '2024-01-05', 4]
            );
            expect(chambres).toHaveLength(1);
            expect(chambres[0].capacite).toBe(4);
        });

        it('devrait retourner un tableau vide si aucune chambre disponible', async () => {
            db.execute.mockResolvedValue([[]]);

            const chambres = await Chambre.findAvailable('2024-01-01', '2024-01-05');

            expect(chambres).toHaveLength(0);
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Chambre.findAvailable('2024-01-01', '2024-01-05')).rejects.toThrow(
                "Erreur lors de la recherche des chambres disponibles: Erreur DB"
            );
        });
    });

    describe('getReservations', () => {
        it('devrait retourner les réservations d\'une chambre', async () => {
            const mockRows = [
                {
                    id: 1,
                    chambre_id: 1,
                    client_id: 1,
                    date_arrivee: '2024-01-01',
                    date_depart: '2024-01-05',
                    client_nom: 'Dupont',
                    client_email: 'dupont@example.com'
                },
                {
                    id: 2,
                    chambre_id: 1,
                    client_id: 2,
                    date_arrivee: '2024-02-01',
                    date_depart: '2024-02-05',
                    client_nom: 'Martin',
                    client_email: 'martin@example.com'
                }
            ];
            db.execute.mockResolvedValue([mockRows]);

            const reservations = await Chambre.getReservations(1);

            expect(db.execute).toHaveBeenCalledWith(
                expect.stringContaining('SELECT r.*, c.nom as client_nom, c.email as client_email'),
                [1]
            );
            expect(reservations).toHaveLength(2);
            expect(reservations[0].client_nom).toBe('Dupont');
            expect(reservations[1].client_nom).toBe('Martin');
        });

        it('devrait retourner un tableau vide si aucune réservation', async () => {
            db.execute.mockResolvedValue([[]]);

            const reservations = await Chambre.getReservations(1);

            expect(reservations).toHaveLength(0);
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Chambre.getReservations(1)).rejects.toThrow(
                "Erreur lors de la récupération des réservations: Erreur DB"
            );
        });
    });
});
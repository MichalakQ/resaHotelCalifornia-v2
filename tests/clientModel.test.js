import Client from './Client.js';
import db from './connexion.js';

// Mock du module de connexion à la base de données
jest.mock('./connexion.js');

describe('Client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('devrait créer une instance Client avec toutes les propriétés', () => {
            const data = {
                id: 1,
                nom: 'Dupont',
                email: 'dupont@example.com',
                telephone: '0123456789',
                nombre_personnes: 4
            };
            const client = new Client(data);

            expect(client.id).toBe(1);
            expect(client.nom).toBe('Dupont');
            expect(client.email).toBe('dupont@example.com');
            expect(client.telephone).toBe('0123456789');
            expect(client.nombre_personnes).toBe(4);
        });
    });

    describe('findAll', () => {
        it('devrait retourner tous les clients', async () => {
            const mockRows = [
                { id: 1, nom: 'Dupont', email: 'dupont@example.com', telephone: '0123456789', nombre_personnes: 4 },
                { id: 2, nom: 'Martin', email: 'martin@example.com', telephone: '0987654321', nombre_personnes: 2 }
            ];
            db.execute.mockResolvedValue([mockRows]);

            const clients = await Client.findAll();

            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM client ORDER BY nom');
            expect(clients).toHaveLength(2);
            expect(clients[0]).toBeInstanceOf(Client);
            expect(clients[0].nom).toBe('Dupont');
            expect(clients[1].nom).toBe('Martin');
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Client.findAll()).rejects.toThrow('Erreur lors de la récupération des clients: Erreur DB');
        });
    });

    describe('findById', () => {
        it('devrait retourner un client par son ID', async () => {
            const mockRow = { id: 1, nom: 'Dupont', email: 'dupont@example.com', telephone: '0123456789', nombre_personnes: 4 };
            db.execute.mockResolvedValue([[mockRow]]);

            const client = await Client.findById(1);

            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM client WHERE id = ?', [1]);
            expect(client).toBeInstanceOf(Client);
            expect(client.nom).toBe('Dupont');
        });

        it('devrait retourner null si le client n\'existe pas', async () => {
            db.execute.mockResolvedValue([[]]);

            const client = await Client.findById(999);

            expect(client).toBeNull();
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Client.findById(1)).rejects.toThrow('Erreur lors de la récupération du client: Erreur DB');
        });
    });

    describe('create', () => {
        it('devrait créer un nouveau client et retourner son ID', async () => {
            const clientData = {
                nom: 'Dupont',
                email: 'dupont@example.com',
                telephone: '0123456789',
                nombre_personnes: 4
            };
            db.execute.mockResolvedValue([{ insertId: 1 }]);

            const insertId = await Client.create(clientData);

            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO client (nom, email, telephone, nombre_personnes) VALUES (?, ?, ?, ?)',
                ['Dupont', 'dupont@example.com', '0123456789', 4]
            );
            expect(insertId).toBe(1);
        });

        it('devrait lancer une erreur si le client existe déjà', async () => {
            const clientData = {
                nom: 'Dupont',
                email: 'dupont@example.com',
                telephone: '0123456789',
                nombre_personnes: 4
            };
            const error = new Error('Duplicate entry');
            error.code = 'ER_DUP_ENTRY';
            db.execute.mockRejectedValue(error);

            await expect(Client.create(clientData)).rejects.toThrow('Ce client existe déjà');
        });

        it('devrait lancer une erreur générique pour d\'autres erreurs', async () => {
            const clientData = {
                nom: 'Dupont',
                email: 'dupont@example.com',
                telephone: '0123456789',
                nombre_personnes: 4
            };
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Client.create(clientData)).rejects.toThrow('Erreur lors de la création du client: Erreur DB');
        });
    });

    describe('update', () => {
        it('devrait mettre à jour un client existant', async () => {
            const clientData = {
                nom: 'Dupont Modifié',
                email: 'dupont.modifie@example.com',
                telephone: '0111111111',
                nombre_personnes: 5
            };
            db.execute.mockResolvedValue([{}]);

            const result = await Client.update(clientData);

            expect(db.execute).toHaveBeenCalledWith(
                'UPDATE client SET nom = ?, email = ?, telephone = ?, nombre_personnes = ? WHERE id = ?',
                ['Dupont Modifié', 'dupont.modifie@example.com', '0111111111', 5, undefined]
            );
            expect(result).toBe(true);
        });

        it('devrait lancer une erreur si le client existe déjà (email en doublon)', async () => {
            const clientData = {
                nom: 'Dupont',
                email: 'dupont@example.com',
                telephone: '0123456789',
                nombre_personnes: 4
            };
            const error = new Error('Duplicate entry');
            error.code = 'ER_DUP_ENTRY';
            db.execute.mockRejectedValue(error);

            await expect(Client.update(clientData)).rejects.toThrow('Ce client existe déjà');
        });

        it('devrait lancer une erreur générique pour d\'autres erreurs', async () => {
            const clientData = {
                nom: 'Dupont',
                email: 'dupont@example.com',
                telephone: '0123456789',
                nombre_personnes: 4
            };
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Client.update(clientData)).rejects.toThrow('Erreur lors de la mise à jour du client: Erreur DB');
        });
    });

    describe('delete', () => {
        it('devrait supprimer un client sans réservations', async () => {
            db.execute
                .mockResolvedValueOnce([[{ count: 0 }]]) // Aucune réservation
                .mockResolvedValueOnce([{}]); // Suppression réussie

            const result = await Client.delete(1);

            expect(db.execute).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM reservation WHERE client_id = ?',
                [1]
            );
            expect(db.execute).toHaveBeenCalledWith('DELETE FROM client WHERE id = ?', [1]);
            expect(result).toBe(true);
        });

        it('devrait lancer une erreur si le client a des réservations', async () => {
            db.execute.mockResolvedValue([[{ count: 3 }]]);

            await expect(Client.delete(1)).rejects.toThrow(
                'Erreur lors de la suppression du client: Impossible de supprimer le client : des réservations sont associées'
            );
            expect(db.execute).toHaveBeenCalledTimes(1);
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Client.delete(1)).rejects.toThrow('Erreur lors de la suppression du client: Erreur DB');
        });
    });

    describe('existsByEmail', () => {
        it('devrait retourner true si l\'email existe', async () => {
            db.execute.mockResolvedValue([[{ count: 1 }]]);

            const exists = await Client.existsByEmail('dupont@example.com');

            expect(db.execute).toHaveBeenCalledWith(
                'SELECT COUNT(*) as count FROM client WHERE email = ?',
                ['dupont@example.com']
            );
            expect(exists).toBe(true);
        });

        it('devrait retourner false si l\'email n\'existe pas', async () => {
            db.execute.mockResolvedValue([[{ count: 0 }]]);

            const exists = await Client.existsByEmail('inconnu@example.com');

            expect(exists).toBe(false);
        });

        it('devrait lancer une erreur en cas de problème de base de données', async () => {
            db.execute.mockRejectedValue(new Error('Erreur DB'));

            await expect(Client.existsByEmail('test@example.com')).rejects.toThrow(
                "Erreur lors de la vérification de l'existence du client: Erreur DB"
            );
        });
    });
});
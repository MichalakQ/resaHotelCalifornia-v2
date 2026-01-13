import db from './connexion.js';
import validator from 'validator';

class Client {
    constructor(data) {
        this.id = data.id;
        this.nom = data.nom;
        this.email = data.email;
        this.telephone = data.telephone;
        this.nombre_personnes = data.nombre_personnes;
    }

    // ==========================================
    // VALIDATION DES DONNÉES
    // ==========================================
    
    static validateId(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new Error('ID invalide');
        }
        return parsedId;
    }

    static validateClientData(data) {
        const errors = [];

        // Validation du nom
        if (!data.nom || typeof data.nom !== 'string') {
            errors.push('Le nom est requis');
        } else if (data.nom.trim().length < 2 || data.nom.trim().length > 100) {
            errors.push('Le nom doit contenir entre 2 et 100 caractères');
        }

        // Validation de l'email
        if (!data.email || !validator.isEmail(data.email)) {
            errors.push('Email invalide');
        }

        // Validation du téléphone (optionnel mais si présent, doit être valide)
        if (data.telephone && !validator.isMobilePhone(data.telephone.toString(), 'any')) {
            errors.push('Numéro de téléphone invalide');
        }

        // Validation du nombre de personnes
        const nbPersonnes = parseInt(data.nombre_personnes, 10);
        if (isNaN(nbPersonnes) || nbPersonnes < 1 || nbPersonnes > 20) {
            errors.push('Le nombre de personnes doit être entre 1 et 20');
        }

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        // Retourner les données nettoyées
        return {
            nom: validator.escape(data.nom.trim()),
            email: validator.normalizeEmail(data.email),
            telephone: data.telephone ? validator.escape(data.telephone.toString().trim()) : null,
            nombre_personnes: nbPersonnes
        };
    }

    // ==========================================
    // MÉTHODES CRUD SÉCURISÉES
    // ==========================================

    // Récupérer tous les clients
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM clients ORDER BY nom');
            return rows.map(row => new Client(row));
        } catch (error) {
            console.error('Erreur findAll:', error);
            throw new Error('Erreur lors de la récupération des clients');
        }
    }

    // Récupérer un client par ID
    static async findById(id) {
        try {
            const safeId = this.validateId(id);
            const [rows] = await db.execute(
                'SELECT * FROM clients WHERE id = ?', 
                [safeId]
            );
            return rows.length > 0 ? new Client(rows[0]) : null;
        } catch (error) {
            console.error('Erreur findById:', error);
            throw new Error('Erreur lors de la récupération du client');
        }
    }

    // Créer un nouveau client
    static async create(clientData) {
        try {
            // Valider et nettoyer les données
            const safeData = this.validateClientData(clientData);

            // Vérifier si l'email existe déjà
            const emailExists = await this.existsByEmail(safeData.email);
            if (emailExists) {
                throw new Error('Un client avec cet email existe déjà');
            }

            const [result] = await db.execute(
                'INSERT INTO clients (nom, email, telephone, nombre_personnes) VALUES (?, ?, ?, ?)',
                [safeData.nom, safeData.email, safeData.telephone, safeData.nombre_personnes]
            );
            return result.insertId;
        } catch (error) {
            console.error('Erreur create:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ce client existe déjà');
            }
            throw error;
        }
    }

    // Mettre à jour un client
    static async update(id, clientData) {
        try {
            const safeId = this.validateId(id);
            const safeData = this.validateClientData(clientData);

            // Vérifier si le client existe
            const existingClient = await this.findById(safeId);
            if (!existingClient) {
                throw new Error('Client non trouvé');
            }

            // Vérifier si l'email est déjà utilisé par un autre client
            const [emailCheck] = await db.execute(
                'SELECT id FROM clients WHERE email = ? AND id != ?',
                [safeData.email, safeId]
            );
            if (emailCheck.length > 0) {
                throw new Error('Cet email est déjà utilisé par un autre client');
            }

            await db.execute(
                'UPDATE clients SET nom = ?, email = ?, telephone = ?, nombre_personnes = ? WHERE id = ?',
                [safeData.nom, safeData.email, safeData.telephone, safeData.nombre_personnes, safeId]
            );
            return true;
        } catch (error) {
            console.error('Erreur update:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ce client existe déjà');
            }
            throw error;
        }
    }

    // Supprimer un client
    static async delete(id) {
        try {
            const safeId = this.validateId(id);

            // Vérifier si le client existe
            const existingClient = await this.findById(safeId);
            if (!existingClient) {
                throw new Error('Client non trouvé');
            }

            // Vérifier s'il y a des réservations associées
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservations WHERE client_id = ?',
                [safeId]
            );
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer : des réservations sont associées');
            }

            await db.execute('DELETE FROM clients WHERE id = ?', [safeId]);
            return true;
        } catch (error) {
            console.error('Erreur delete:', error);
            throw error;
        }
    }

    // Vérifier si un client existe par email
    static async existsByEmail(email) {
        try {
            if (!email || !validator.isEmail(email)) {
                return false;
            }
            const safeEmail = validator.normalizeEmail(email);
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM clients WHERE email = ?',
                [safeEmail]
            );
            return rows[0].count > 0;
        } catch (error) {
            console.error('Erreur existsByEmail:', error);
            throw new Error("Erreur lors de la vérification de l'email");
        }
    }

    // Recherche sécurisée par nom (nouvelle méthode)
    static async searchByName(searchTerm) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string') {
                return [];
            }
            // Nettoyer et échapper le terme de recherche
            const safeTerm = `%${validator.escape(searchTerm.trim())}%`;
            const [rows] = await db.execute(
                'SELECT * FROM clients WHERE nom LIKE ? ORDER BY nom LIMIT 50',
                [safeTerm]
            );
            return rows.map(row => new Client(row));
        } catch (error) {
            console.error('Erreur searchByName:', error);
            throw new Error('Erreur lors de la recherche');
        }
    }
}

export default Client;

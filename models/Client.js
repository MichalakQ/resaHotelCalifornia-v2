import db from './connexion.js';
class Client {
    constructor(data) {
        this.id = data.id;
        this.nom = data.nom;
        this.email = data.email;
        this.telephone = data.telephone;
        this.nombre_personnes = data.nombre_personnes;
    }

    // Récupérer tous les clients
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM clients ORDER BY nom');
            return rows.map(row => new Client(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des clients: ' + error.message);
        }
    }

    // Récupérer un client par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM client WHERE id = ?', [id]);
            return rows.length > 0 ? new Client(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération du client: ' + error.message);
        }
    }

    // Créer un nouveau client
    static async create(clientData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO clients (nom, email, telephone, nombre_personnes) VALUES (?, ?, ?, ?)',
                [clientData.nom, clientData.email, clientData.telephone, clientData.nombre_personnes]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ce client existe déjà');
            }
            throw new Error('Erreur lors de la création du client: ' + error.message);
        }
    }

    // Mettre à jour un client
    static async update(clientData) {
        try {
            await db.execute(
                'UPDATE client SET nom = ?, email = ?, telephone = ?, nombre_personnes = ? WHERE id = ?',
                [clientData.nom, clientData.email, clientData.telephone, clientData.nombre_personnes, this.id]
            );
            this.nom = clientData.nom;
            this.email = clientData.email;
            this.telephone = clientData.telephone;
            this.nombre_personnes = clientData.nombre_personnes;
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ce client existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour du client: ' + error.message);
        }
    }

    // Supprimer un client
    static async delete(id) {
        try {
            // Vérifier s'il y a des réservations associées
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservation WHERE client_id = ?',
                [id]
            );
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer le client : des réservations sont associées');
            }
            await db.execute('DELETE FROM client WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression du client: ' + error.message);
        }
    }

    // Vérifier si un client existe par email
    static async existsByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM client WHERE email = ?',
                [email]
            );
            return rows[0].count > 0;
        } catch (error) {
            throw new Error("Erreur lors de la vérification de l'existence du client: " + error.message);
        }
    }
}

export default Client;
import db from './connexion.js';
import db from './db'; 
class Client {
    constructor(data) {
        this.id = data.id;
        this.nom = data.nom;
        this.email = data.email;
        this.telephone = data.telephone;
        this.nombre_personnes = data.nombre_personnes;
    }
    // Récupérer toutes les clients
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM Clients ORDER BY nom');
            return rows.map(row => new Client(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des clients: ' + error.message);
        }
    }
    // Récupérer une client par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM clients WHERE id = ?', [id]);
            return rows.length > 0 ? new Client(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la client: ' + error.message);
        }
    }
    // Créer un nouveaux client
    static async create(clientData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO client (nom, email, telephone, nombre_personnes) VALUES (?, ?, ?, ?)',
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
    // Mettre à jour une chambre
    async update(clientData) {
        try {
            await db.execute(
                'UPDATE client SET nom = ?, email = ?, telephone = ?, nombre_personnes = ?,  WHERE id = ?',
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
    async delete(id) {
        try {
            // Vérifier s'il y a des noms de clients existant

            const [clients] = await db.execute(
                'SELECT COUNT(*) as count FROM client WHERE client_id = ?',
                [id]
            );
            if (clients[0].count > 0) {
                throw new Error('Impossible de supprimer le nom des clients sont associées');
            }
            await db.execute('DELETE FROM clients WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression du client: ' + error.message);
        }
    }
    // Vérifier l'existance d'un client
    static async isAvailable(clientsId, email, telephone, nombre_personnes) {
        try {
            const [rows] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM clients
    WHERE clients_id = ?
    
    `, [clientsId]);
            return rows[0].count === 0;
        } catch (error) {
            throw new Error("Erreur lors de la vérification de l'existance du client: " + error.message);
        }
    }
}
export default Client;
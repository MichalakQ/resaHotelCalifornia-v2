import db from './connexion.js';
class Chambre {
    constructor(data) {
        this.id = data.id;
        this.numero = data.numero;
        this.capacite = data.capacite;
    }
    // Récupérer toutes les chambres
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM chambres ORDER BY numero');
            return rows.map(row => new Chambre(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des chambres: ' + error.message);
        }
    }
    // Récupérer une chambre par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM chambres WHERE id = ?', [id]);
            return rows.length > 0 ? new Chambre(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la chambre: ' + error.message);
        }
    }
    // Créer une nouvelle chambre
    static async create(chambreData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO chambres (numero, capacite) VALUES (?, ?)',
                [chambreData.numero, chambreData.capacite]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ce numéro de chambre existe déjà');
            }
            throw new Error('Erreur lors de la création de la chambre: ' + error.message);
        }
    }
    // Mettre à jour une chambre
    async update(chambreData) {
        try {
            await db.execute(
                'UPDATE chambres SET numero = ?, capacite = ? WHERE id = ?',
                [chambreData.numero, chambreData.capacite, this.id]
            );
            this.numero = chambreData.numero;
            this.capacite = chambreData.capacite;
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ce numéro de chambre existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour de la chambre: ' + error.message);
        }
    }
    // Supprimer une chambre
    async delete(id) {
        try {
            // Vérifier s'il y a des réservations
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservations WHERE chambre_id = ?',
                [id]
            );
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer la chambre des réservations sont associées');
            }
            await db.execute('DELETE FROM chambres WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de la chambre: ' + error.message);
        }
    }
    // Vérifier la disponibilité d'une chambre
    static async isAvailable(chambreId, dateArrivee, dateDepart) {
        try {
            const [rows] = await db.execute(`
    SELECT COUNT(*) as count
    FROM reservations
    WHERE chambre_id = ?
    AND (
    (date_arrivee <= ? AND date_depart > ?) OR
    (date_arrivee < ? AND date_depart >= ?) OR
    (date_arrivee >= ? AND date_depart <= ?)
    )
    `, [chambreId, dateArrivee, dateArrivee, dateDepart, dateDepart, dateArrivee, dateDepart]);
            return rows[0].count === 0;
        } catch (error) {
            throw new Error('Erreur lors de la vérification de disponibilité: ' + error.message);
        }
    }
}
module.exports = Chambre;
import db from './connexion.js';
class Reservation {
    constructor(data) {
        this.id = data.id;
        this.clients_id = data.clients_id;
        this.chambre_id = data.chambre_id;
        this.date_arrivee = data.date_arrivee;
        this.date_depart = data.date_depart;
    }
    // Récupérer toutes les reservations
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM reservations ORDER BY chambre_id, client_id');
            return rows.map(row => new Reservation(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des réservations: ' + error.message);
        }
    }
    // Récupérer une reservation par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM reservation WHERE id = ?  AND autre_id = ?', [id, secondId]);
            return rows.length > 0 ? new Reservation(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la client: ' + error.message);
        }
    }
    // Créer une nouvelle reservation
    static async create(ReservationData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO reservation (client_id, chambre_id, date_arrivee, date_depart) VALUES (?, ?, ?, ?)',
                [ReservationData.client_id, ReservationData.chambre_id, ReservationData.date_arrivee, ReservationData.date_depart]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette reservation existe déjà');
            }
            throw new Error('Erreur lors de la création de la reservation: ' + error.message);
        }
    }
    // Mettre à jour une reservation
    async update(ReservationData) {
        try {
            await db.execute(
                'UPDATE reservation SET client_id = ?, chambre_id = ?, date_arrivee = ?, date_depart = ?,  WHERE id = ?',
                [ReservationData.client_id, ReservationData.chambre_id, ReservationData.date_arrivee, ReservationData.date_depart, this.id]
            );
            
            this.clients_id = ReservationData.client_id;
            this.chambre_id = ReservationData.chambre_id;
            this.date_arrivee = ReservationData.date_arrivee;
            this.date_depart = ReservationData.date_depart;
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette reservation existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour de la reservation: ' + error.message);
        }
    }
    // Supprimer une reservation
    async delete(id) {
        try {
            // Vérifier s'il y a des reservations existantes
            
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservation WHERE client_id = ?  AND chambre_id = ?',
                [id, secondeId]
            );
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer la reservation sont associées');
            }
            await db.execute('DELETE FROM reservation WHERE id = ? AND chambre_id = ?', [id, secondeId]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de la reservation: ' + error.message);
        }
    }
    // Vérifier l'existance d'une reservation
    static async isAvailable(clients_id, chambre_id, date_arrivee, date_depart) {
        try {
            const [rows] = await db.execute(`
    SELECT COUNT(*) as count 
    FROM reservation
    WHERE clients_id = ? chambre_id = ?'
    
    `, [clients_id, chambre_id]);
            return rows[0].count === 0;
        } catch (error) {
            throw new Error("Erreur lors de la vérification de l'existance d'une reservation: " + error.message);
        }
    }
}
module.exports = Reservation;
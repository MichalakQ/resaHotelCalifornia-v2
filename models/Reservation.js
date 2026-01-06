import db from './connexion.js';

class Reservation {
    constructor(data) {
        this.id = data.id;
        this.client_id = data.client_id;
        this.chambre_id = data.chambre_id;
        this.date_arrivee = data.date_arrivee;
        this.date_depart = data.date_depart;
    }

    // Récupérer toutes les réservations
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM reservations ORDER BY chambre_id, client_id');
            return rows.map(row => new Reservation(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des réservations: ' + error.message);
        }
    }

    // Récupérer une réservation par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM reservations WHERE id = ?', [id]);
            return rows.length > 0 ? new Reservation(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la réservation: ' + error.message);
        }
    }

    // Créer une nouvelle réservation
    static async create(reservationData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES (?, ?, ?, ?)',
                [reservationData.client_id, reservationData.chambre_id, reservationData.date_arrivee, reservationData.date_depart]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette réservation existe déjà');
            }
            throw new Error('Erreur lors de la création de la réservation: ' + error.message);
        }
    }

    // Mettre à jour une réservation
    async update(reservationData) {
        try {
            await db.execute(
                'UPDATE reservations SET client_id = ?, chambre_id = ?, date_arrivee = ?, date_depart = ? WHERE id = ?',
                [reservationData.client_id, reservationData.chambre_id, reservationData.date_arrivee, reservationData.date_depart, this.id]
            );
            
            this.client_id = reservationData.client_id;
            this.chambre_id = reservationData.chambre_id;
            this.date_arrivee = reservationData.date_arrivee;
            this.date_depart = reservationData.date_depart;
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette réservation existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour de la réservation: ' + error.message);
        }
    }

    // Supprimer une réservation
    static async delete(id) {
        try {
            await db.execute('DELETE FROM reservations WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de la réservation: ' + error.message);
        }
    }

    // Vérifier si une chambre est disponible pour une période donnée
    static async isRoomAvailable(chambre_id, date_arrivee, date_depart, excludeReservationId = null) {
        try {
            let query = `
                SELECT COUNT(*) as count 
                FROM reservation
                WHERE chambre_id = ?
                AND (
                    (date_arrivee <= ? AND date_depart >= ?)
                    OR (date_arrivee <= ? AND date_depart >= ?)
                    OR (date_arrivee >= ? AND date_depart <= ?)
                )
            `;
            let params = [chambre_id, date_arrivee, date_arrivee, date_depart, date_depart, date_arrivee, date_depart];
            
            // Exclure une réservation spécifique (utile lors de la modification)
            if (excludeReservationId) {
                query += ' AND id != ?';
                params.push(excludeReservationId);
            }
            
            const [rows] = await db.execute(query, params);
            return rows[0].count === 0;
        } catch (error) {
            throw new Error("Erreur lors de la vérification de la disponibilité: " + error.message);
        }
    }

    // Récupérer les réservations d'un client
    static async findByClientId(clientId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM reservations WHERE client_id = ? ORDER BY date_arrivee DESC',
                [clientId]
            );
            return rows.map(row => new Reservation(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des réservations du client: ' + error.message);
        }
    }

    // Récupérer les réservations d'une chambre
    static async findByChambreId(chambreId) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM reservations WHERE chambre_id = ? ORDER BY date_arrivee DESC',
                [chambreId]
            );
            return rows.map(row => new Reservation(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des réservations de la chambre: ' + error.message);
        }
    }
}

export default Reservation;
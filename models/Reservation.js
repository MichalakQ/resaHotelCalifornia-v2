import db from './connexion.js';
import validator from 'validator';

class Reservation {
    constructor(data) {
        this.id = data.id;
        this.client_id = data.client_id;
        this.nom = data.nom;
        this.chambre_id = data.chambre_id;
        this.numero = data.numero;
        this.date_arrivee = new Date(data.date_arrivee);
        this.date_depart = new Date(data.date_depart);
    }

    // ✅ Méthode de validation centralisée
    static validateReservationData(data, isUpdate = false) {
        const errors = [];

        // Validation client_id
        if (data.client_id === undefined || data.client_id === null) {
            errors.push('client_id est requis');
        } else if (!Number.isInteger(Number(data.client_id)) || Number(data.client_id) <= 0) {
            errors.push('client_id doit être un entier positif');
        }

        // Validation chambre_id
        if (data.chambre_id === undefined || data.chambre_id === null) {
            errors.push('chambre_id est requis');
        } else if (!Number.isInteger(Number(data.chambre_id)) || Number(data.chambre_id) <= 0) {
            errors.push('chambre_id doit être un entier positif');
        }

        // Validation des dates
        if (!data.date_arrivee) {
            errors.push('date_arrivee est requise');
        } else if (!validator.isISO8601(String(data.date_arrivee))) {
            errors.push('date_arrivee doit être une date valide (format ISO8601)');
        }

        if (!data.date_depart) {
            errors.push('date_depart est requise');
        } else if (!validator.isISO8601(String(data.date_depart))) {
            errors.push('date_depart doit être une date valide (format ISO8601)');
        }

        // Vérifier que date_depart > date_arrivee
        if (data.date_arrivee && data.date_depart) {
            const arrivee = new Date(data.date_arrivee);
            const depart = new Date(data.date_depart);
            if (depart <= arrivee) {
                errors.push('La date de départ doit être postérieure à la date d\'arrivée');
            }
        }

        if (errors.length > 0) {
            throw new Error(`Validation échouée: ${errors.join(', ')}`);
        }

        // Retourne les données nettoyées
        return {
            client_id: Number(data.client_id),
            chambre_id: Number(data.chambre_id),
            date_arrivee: new Date(data.date_arrivee).toISOString().split('T')[0],
            date_depart: new Date(data.date_depart).toISOString().split('T')[0]
        };
    }

    // ✅ Validation d'ID
    static validateId(id) {
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) {
            throw new Error('ID invalide: doit être un entier positif');
        }
        return numId;
    }

    // Récupérer toutes les réservations (pas de paramètres = OK)
    static async findAll() {
        try {
            const [rows] = await db.execute(`
                SELECT 
                    r.id,
                    r.client_id,
                    r.chambre_id,
                    r.date_arrivee,
                    r.date_depart,
                    s.nom,
                    c.numero
                FROM reservations r
                JOIN clients s ON r.client_id = s.id
                JOIN chambres c ON r.chambre_id = c.id
                ORDER BY c.numero, s.nom
            `);
            return rows.map(row => new Reservation(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des réservations');
        }
    }

    // ✅ Avec validation
    static async findById(id) {
        try {
            const validId = this.validateId(id);
            
            const [rows] = await db.execute(`
                SELECT r.id, nom, numero, client_id, chambre_id, date_arrivee, date_depart 
                FROM reservations r 
                JOIN chambres c ON r.chambre_id = c.id 
                JOIN clients s ON r.client_id = s.id 
                WHERE r.id = ?`, 
                [validId]
            );
            return rows.length > 0 ? new Reservation(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la réservation: ' + error.message);
        }
    }

    // ✅ Avec validation complète
    static async create(reservationData) {
        try {
            // Validation et nettoyage des données
            const cleanData = this.validateReservationData(reservationData);

            // Vérifier la disponibilité de la chambre
            const isAvailable = await this.isRoomAvailable(
                cleanData.chambre_id, 
                cleanData.date_arrivee, 
                cleanData.date_depart
            );
            
            if (!isAvailable) {
                throw new Error('La chambre n\'est pas disponible pour cette période');
            }

            const [result] = await db.execute(
                'INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES (?, ?, ?, ?)',
                [cleanData.client_id, cleanData.chambre_id, cleanData.date_arrivee, cleanData.date_depart]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette réservation existe déjà');
            }
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new Error('Client ou chambre inexistant');
            }
            throw new Error('Erreur lors de la création de la réservation: ' + error.message);
        }
    }

    // ✅ Avec validation complète
    async update(reservationData) {
        try {
            const cleanData = Reservation.validateReservationData(reservationData);

            // Vérifier la disponibilité (en excluant cette réservation)
            const isAvailable = await Reservation.isRoomAvailable(
                cleanData.chambre_id, 
                cleanData.date_arrivee, 
                cleanData.date_depart,
                this.id
            );
            
            if (!isAvailable) {
                throw new Error('La chambre n\'est pas disponible pour cette période');
            }

            await db.execute(
                'UPDATE reservations SET client_id = ?, chambre_id = ?, date_arrivee = ?, date_depart = ? WHERE id = ?',
                [cleanData.client_id, cleanData.chambre_id, cleanData.date_arrivee, cleanData.date_depart, this.id]
            );

            Object.assign(this, cleanData);
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette réservation existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour: ' + error.message);
        }
    }

    // ✅ Avec validation
    static async delete(id) {
        try {
            const validId = this.validateId(id);
            const [result] = await db.execute('DELETE FROM reservations WHERE id = ?', [validId]);
            
            if (result.affectedRows === 0) {
                throw new Error('Réservation non trouvée');
            }
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression: ' + error.message);
        }
    }

    // ✅ Corrigé: nom de table "reservations" (pas "reservation")
    static async isRoomAvailable(chambre_id, date_arrivee, date_depart, excludeReservationId = null) {
        try {
            const validChambreId = this.validateId(chambre_id);
            
            let query = `
                SELECT COUNT(*) as count 
                FROM reservations
                WHERE chambre_id = ?
                AND (
                    (date_arrivee <= ? AND date_depart > ?)
                    OR (date_arrivee < ? AND date_depart >= ?)
                    OR (date_arrivee >= ? AND date_depart <= ?)
                )
            `;
            let params = [validChambreId, date_arrivee, date_arrivee, date_depart, date_depart, date_arrivee, date_depart];

            if (excludeReservationId) {
                const validExcludeId = this.validateId(excludeReservationId);
                query += ' AND id != ?';
                params.push(validExcludeId);
            }

            const [rows] = await db.execute(query, params);
            return rows[0].count === 0;
        } catch (error) {
            throw new Error("Erreur lors de la vérification de la disponibilité: " + error.message);
        }
    }

    static async findByClientId(clientId) {
        try {
            const validId = this.validateId(clientId);
            const [rows] = await db.execute(
                'SELECT * FROM reservations WHERE client_id = ? ORDER BY date_arrivee DESC',
                [validId]
            );
            return rows.map(row => new Reservation(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération: ' + error.message);
        }
    }

    static async findByChambreId(chambreId) {
        try {
            const validId = this.validateId(chambreId);
            const [rows] = await db.execute(
                'SELECT * FROM reservations WHERE chambre_id = ? ORDER BY date_arrivee DESC',
                [validId]
            );
            return rows.map(row => new Reservation(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération: ' + error.message);
        }
    }
}

export default Reservation;

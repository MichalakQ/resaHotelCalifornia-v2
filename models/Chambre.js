import db from './connexion.js';

class Chambre {
    constructor(data) {
        this.id = data.id;
        this.numero = data.numero;
        this.capacite = data.capacite;
        // Champs optionnels qui n'existent pas dans la base SQL de base
        this.type = data.type || null;
        this.prix = data.prix || null;
        this.disponible = data.disponible !== undefined ? data.disponible : true;
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
            // Champs obligatoires selon le SQL
            const columns = ['numero', 'capacite'];
            const values = [chambreData.numero, chambreData.capacite];
            const placeholders = ['?', '?'];

            // Ajouter les champs optionnels s'ils existent (si vous avez modifié le SQL pour les ajouter)
            if (chambreData.type !== undefined && chambreData.type !== null) {
                columns.push('type');
                values.push(chambreData.type);
                placeholders.push('?');
            }

            if (chambreData.prix !== undefined && chambreData.prix !== null) {
                columns.push('prix');
                values.push(chambreData.prix);
                placeholders.push('?');
            }

            if (chambreData.disponible !== undefined) {
                columns.push('disponible');
                // Convertir en 1/0 pour MySQL BOOLEAN
                values.push(chambreData.disponible ? 1 : 0);
                placeholders.push('?');
            }

            const query = `INSERT INTO chambres (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
            const [result] = await db.execute(query, values);
            
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette chambre existe déjà');
            }
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                throw new Error('Erreur: un champ n\'existe pas dans la table. Vérifiez que vous avez modifié le SQL pour ajouter les colonnes type, prix et disponible.');
            }
            throw new Error('Erreur lors de la création de la chambre: ' + error.message);
        }
    }

    // Mettre à jour une chambre
    async update(chambreData) {
        try {
            // Préparer les champs à mettre à jour
            const updates = [];
            const values = [];

            if (chambreData.numero !== undefined) {
                updates.push('numero = ?');
                values.push(chambreData.numero);
            }

            if (chambreData.capacite !== undefined) {
                updates.push('capacite = ?');
                values.push(chambreData.capacite);
            }

            // Champs optionnels
            if (chambreData.type !== undefined) {
                updates.push('type = ?');
                values.push(chambreData.type);
            }

            if (chambreData.prix !== undefined) {
                updates.push('prix = ?');
                values.push(chambreData.prix);
            }

            if (chambreData.disponible !== undefined) {
                updates.push('disponible = ?');
                // Convertir en 1/0 pour MySQL BOOLEAN
                values.push(chambreData.disponible ? 1 : 0);
            }

            // Vérifier qu'il y a au moins un champ à mettre à jour
            if (updates.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(this.id);

            const query = `UPDATE chambres SET ${updates.join(', ')} WHERE id = ?`;
            await db.execute(query, values);

            // Mettre à jour l'instance
            if (chambreData.numero !== undefined) this.numero = chambreData.numero;
            if (chambreData.capacite !== undefined) this.capacite = chambreData.capacite;
            if (chambreData.type !== undefined) this.type = chambreData.type;
            if (chambreData.prix !== undefined) this.prix = chambreData.prix;
            if (chambreData.disponible !== undefined) this.disponible = chambreData.disponible;

            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette chambre existe déjà');
            }
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                throw new Error('Erreur: un champ n\'existe pas dans la table. Vérifiez que vous avez modifié le SQL pour ajouter les colonnes type, prix et disponible.');
            }
            throw new Error('Erreur lors de la mise à jour de la chambre: ' + error.message);
        }
    }

    // Supprimer une chambre (méthode statique)
    static async delete(id) {
        try {
            // Vérifier s'il y a des réservations associées
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservations WHERE chambre_id = ?',
                [id]
            );
            
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer la chambre : des réservations sont associées');
            }
            
            await db.execute('DELETE FROM chambres WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de la chambre: ' + error.message);
        }
    }

    // Vérifier la disponibilité d'une chambre pour une période donnée
    static async isAvailable(chambreId, dateArrivee, dateDepart) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as count
                FROM reservations
                WHERE chambre_id = ?
                AND (
                    (date_arrivee <= ? AND date_depart >= ?)
                    OR (date_arrivee <= ? AND date_depart >= ?)
                    OR (date_arrivee >= ? AND date_depart <= ?)
                )
            `, [chambreId, dateArrivee, dateArrivee, dateDepart, dateDepart, dateArrivee, dateDepart]);
            
            return rows[0].count === 0;
        } catch (error) {
            throw new Error("Erreur lors de la vérification de la disponibilité de la chambre: " + error.message);
        }
    }

    // Récupérer les chambres disponibles pour une période donnée
    static async findAvailable(dateArrivee, dateDepart, capaciteMin = null) {
        try {
            let query = `
                SELECT c.* 
                FROM chambres c
                WHERE c.id NOT IN (
                    SELECT r.chambre_id 
                    FROM reservations r
                    WHERE (
                        (r.date_arrivee <= ? AND r.date_depart >= ?)
                        OR (r.date_arrivee <= ? AND r.date_depart >= ?)
                        OR (r.date_arrivee >= ? AND r.date_depart <= ?)
                    )
                )
            `;
            
            const params = [dateArrivee, dateArrivee, dateDepart, dateDepart, dateArrivee, dateDepart];

            // Filtrer par capacité si spécifié
            if (capaciteMin !== null) {
                query += ' AND c.capacite >= ?';
                params.push(capaciteMin);
            }

            query += ' ORDER BY c.numero';

            const [rows] = await db.execute(query, params);
            return rows.map(row => new Chambre(row));
        } catch (error) {
            throw new Error("Erreur lors de la recherche des chambres disponibles: " + error.message);
        }
    }

    // Récupérer les réservations d'une chambre
    static async getReservations(chambreId) {
        try {
            const [rows] = await db.execute(`
                SELECT r.*, c.nom as client_nom, c.email as client_email
                FROM reservations r
                JOIN clients c ON r.client_id = c.id
                WHERE r.chambre_id = ?
                ORDER BY r.date_arrivee DESC
            `, [chambreId]);
            
            return rows;
        } catch (error) {
            throw new Error("Erreur lors de la récupération des réservations: " + error.message);
        }
    }
}

export default Chambre;
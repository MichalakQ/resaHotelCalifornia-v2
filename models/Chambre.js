import db from './connexion.js';

class Chambre {
    constructor(data) {
        console.log('Constructor Chambre appelé avec data:', data);
        this.id = data.id;
        this.numero = data.numero;
        this.capacite = data.capacite;
        // Champs optionnels qui n'existent pas dans la base SQL de base
    }

    // Récupérer toutes les chambres
    static async findAll() {
        console.log('Chambre.findAll() appelé');
        try {
            const [rows] = await db.execute('SELECT * FROM chambres ORDER BY numero');
            console.log('Chambres récupérées:', rows.length, 'chambres');
            return rows.map(row => new Chambre(row));
        } catch (error) {
            console.error('Erreur findAll:', error.message);
            throw new Error('Erreur lors de la récupération des chambres: ' + error.message);
        }
    }

    // Récupérer une chambre par ID
    static async findById(id) {
        console.log('Chambre.findById() appelé avec id:', id);
        try {
            const [rows] = await db.execute('SELECT * FROM chambres WHERE id = ?', [id]);
            console.log('Résultat findById:', rows.length > 0 ? 'Trouvée' : 'Non trouvée');
            return rows.length > 0 ? new Chambre(rows[0]) : null;
        } catch (error) {
            console.error('Erreur findById:', error.message);
            throw new Error('Erreur lors de la récupération de la chambre: ' + error.message);
        }
    }

    // Créer une nouvelle chambre
    static async create(chambreData) {
        console.log('Chambre.create() appelé avec:', chambreData);
        try {
            // Champs obligatoires selon le SQL
            const columns = ['numero', 'capacite'];
            const values = [chambreData.numero, chambreData.capacite];
            const placeholders = ['?', '?'];

            // Ajouter les champs optionnels s'ils existent (si vous avez modifié le SQL pour les ajouter)
            if (chambreData.type !== undefined && chambreData.type !== null) {
                console.log('Ajout du champ type:', chambreData.type);
                columns.push('type');
                values.push(chambreData.type);
                placeholders.push('?');
            }

            if (chambreData.prix !== undefined && chambreData.prix !== null) {
                console.log('➕ Ajout du champ prix:', chambreData.prix);
                columns.push('prix');
                values.push(chambreData.prix);
                placeholders.push('?');
            }

            if (chambreData.disponible !== undefined) {
                console.log('Ajout du champ disponible:', chambreData.disponible);
                columns.push('disponible');
                // Convertir en 1/0 pour MySQL BOOLEAN
                values.push(chambreData.disponible ? 1 : 0);
                placeholders.push('?');
            }

            const query = `INSERT INTO chambres (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
            console.log('Requête SQL:', query);
            console.log('Valeurs:', values);
            
            const [result] = await db.execute(query, values);
            console.log('Chambre créée avec ID:', result.insertId);
            
            return result.insertId;
        } catch (error) {
            console.error('Erreur create:', error.code, '-', error.message);
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
        console.log('Chambre.update() appelé pour ID:', this.id, 'avec data:', chambreData);
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
                console.warn('⚠️ Aucune donnée à mettre à jour');
                throw new Error('Aucune donnée à mettre à jour');
            }

            values.push(this.id);

            const query = `UPDATE chambres SET ${updates.join(', ')} WHERE id = ?`;
            console.log('Requête UPDATE:', query);
            console.log('Valeurs:', values);
            
            await db.execute(query, values);
            console.log('Chambre mise à jour avec succès');

            // Mettre à jour l'instance
            if (chambreData.numero !== undefined) this.numero = chambreData.numero;
            if (chambreData.capacite !== undefined) this.capacite = chambreData.capacite;
            if (chambreData.type !== undefined) this.type = chambreData.type;
            if (chambreData.prix !== undefined) this.prix = chambreData.prix;
            if (chambreData.disponible !== undefined) this.disponible = chambreData.disponible;

            return true;
        } catch (error) {
            console.error('Erreur update:', error.code, '-', error.message);
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
        console.log('Chambre.delete() appelé pour ID:', id);
        try {
            // Vérifier s'il y a des réservations associées
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservations WHERE chambre_id = ?',
                [id]
            );
            
            console.log('Nombre de réservations associées:', reservations[0].count);
            
            if (reservations[0].count > 0) {
                console.warn('Impossible de supprimer: réservations existantes');
                throw new Error('Impossible de supprimer la chambre : des réservations sont associées');
            }
            
            await db.execute('DELETE FROM chambres WHERE id = ?', [id]);
            console.log('Chambre supprimée avec succès');
            return true;
        } catch (error) {
            console.error('Erreur delete:', error.message);
            throw new Error('Erreur lors de la suppression de la chambre: ' + error.message);
        }
    }

    // Vérifier la disponibilité d'une chambre pour une période donnée
    static async isAvailable(chambreId, dateArrivee, dateDepart) {
        console.log('Chambre.isAvailable() appelé pour:', { chambreId, dateArrivee, dateDepart });
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
            
            const available = rows[0].count === 0;
            console.log('Disponibilité:', available ? 'Disponible' : 'Non disponible');
            return available;
        } catch (error) {
            console.error('Erreur isAvailable:', error.message);
            throw new Error("Erreur lors de la vérification de la disponibilité de la chambre: " + error.message);
        }
    }

    // Récupérer les chambres disponibles pour une période donnée
    static async findAvailable(dateArrivee, dateDepart, capaciteMin = null) {
        console.log('Chambre.findAvailable() appelé avec:', { dateArrivee, dateDepart, capaciteMin });
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
                console.log('Filtrage par capacité min:', capaciteMin);
                query += ' AND c.capacite >= ?';
                params.push(capaciteMin);
            }

            query += ' ORDER BY c.numero';

            const [rows] = await db.execute(query, params);
            console.log('Chambres disponibles trouvées:', rows.length);
            return rows.map(row => new Chambre(row));
        } catch (error) {
            console.error('Erreur findAvailable:', error.message);
            throw new Error("Erreur lors de la recherche des chambres disponibles: " + error.message);
        }
    }

    // Récupérer les réservations d'une chambre
    static async getReservations(chambreId) {
        console.log('Chambre.getReservations() appelé pour ID:', chambreId);
        try {
            const [rows] = await db.execute(`
                SELECT r.*, c.nom as client_nom, c.email as client_email
                FROM reservations r
                JOIN clients c ON r.client_id = c.id
                WHERE r.chambre_id = ?
                ORDER BY r.date_arrivee DESC
            `, [chambreId]);
            
            console.log('Réservations trouvées:', rows.length);
            return rows;
        } catch (error) {
            console.error('Erreur getReservations:', error.message);
            throw new Error("Erreur lors de la récupération des réservations: " + error.message);
        }
    }
}

export default Chambre;
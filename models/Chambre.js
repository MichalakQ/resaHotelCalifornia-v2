import db from './connexion.js';

class Chambre {
    constructor(data) {
        this.id = data.id;
        this.numero = data.numero;
        this.type = data.type || null;
        this.prix = data.prix || null;
        this.capacite = data.capacite || null;
        this.disponible = data.disponible !== undefined ? data.disponible : true;
    }

    // Récupérer toutes les chambres
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM chambre ORDER BY numero');
            return rows.map(row => new Chambre(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des chambres: ' + error.message);
        }
    }

    // Récupérer une chambre par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM chambre WHERE id = ?', [id]);
            return rows.length > 0 ? new Chambre(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la chambre: ' + error.message);
        }
    }

    // Créer une nouvelle chambre
    static async create(chambreData) {
        try {
            // Préparer les colonnes et valeurs dynamiquement
            const columns = ['numero'];
            const values = [chambreData.numero];
            const placeholders = ['?'];

            // Ajouter les champs optionnels s'ils existent
            if (chambreData.type) {
                columns.push('type');
                values.push(chambreData.type);
                placeholders.push('?');
            }

            if (chambreData.prix) {
                columns.push('prix');
                values.push(chambreData.prix);
                placeholders.push('?');
            }

            if (chambreData.capacite) {
                columns.push('capacite');
                values.push(chambreData.capacite);
                placeholders.push('?');
            }

            if (chambreData.disponible !== undefined) {
                columns.push('disponible');
                values.push(chambreData.disponible);
                placeholders.push('?');
            }

            const query = `INSERT INTO chambre (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
            const [result] = await db.execute(query, values);
            
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette chambre existe déjà');
            }
            throw new Error('Erreur lors de la création de la chambre: ' + error.message);
        }
    }

    // Mettre à jour une chambre
    static async update(chambreData) {
        try {
            // Préparer les champs à mettre à jour
            const updates = [];
            const values = [];

            if (chambreData.numero) {
                updates.push('numero = ?');
                values.push(chambreData.numero);
            }

            if (chambreData.type) {
                updates.push('type = ?');
                values.push(chambreData.type);
            }

            if (chambreData.prix) {
                updates.push('prix = ?');
                values.push(chambreData.prix);
            }

            if (chambreData.capacite) {
                updates.push('capacite = ?');
                values.push(chambreData.capacite);
            }

            if (chambreData.disponible !== undefined) {
                updates.push('disponible = ?');
                values.push(chambreData.disponible);
            }

            values.push(this.id);

            const query = `UPDATE chambre SET ${updates.join(', ')} WHERE id = ?`;
            await db.execute(query, values);

            // Mettre à jour l'instance
            if (chambreData.numero) this.numero = chambreData.numero;
            if (chambreData.type) this.type = chambreData.type;
            if (chambreData.prix) this.prix = chambreData.prix;
            if (chambreData.capacite) this.capacite = chambreData.capacite;
            if (chambreData.disponible !== undefined) this.disponible = chambreData.disponible;

            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette chambre existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour de la chambre: ' + error.message);
        }
    }

    // Supprimer une chambre (méthode statique)
    static async delete(id) {
        try {
            // Vérifier s'il y a des réservations associées
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservation WHERE chambre_id = ?',
                [id]
            );
            
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer la chambre : des réservations sont associées');
            }
            
            await db.execute('DELETE FROM chambre WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de la chambre: ' + error.message);
        }
    }

    // Vérifier la disponibilité d'une chambre
    static async isAvailable(chambreId, dateDebut, dateFin) {
        try {
            const [rows] = await db.execute(`
                SELECT COUNT(*) as count
                FROM reservation
                WHERE chambre_id = ?
                AND (
                    (date_debut <= ? AND date_fin >= ?)
                    OR (date_debut <= ? AND date_fin >= ?)
                    OR (date_debut >= ? AND date_fin <= ?)
                )
            `, [chambreId, dateDebut, dateDebut, dateFin, dateFin, dateDebut, dateFin]);
            
            return rows[0].count === 0;
        } catch (error) {
            throw new Error("Erreur lors de la vérification de la disponibilité de la chambre: " + error.message);
        }
    }
}

export default Chambre;
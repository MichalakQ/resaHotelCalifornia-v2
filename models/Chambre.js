import express from 'express';
import { body } from 'express-validator';
import db from './db'; // Import manquant pour la connexion à la base de données

const router = express.Router();

// Validation des données de chambre
const chambreValidation = [
    body('numero')
        .notEmpty()
        .withMessage('Le numéro de chambre est obligatoire')
        .isLength({ min: 1, max: 10 })
        .withMessage('Le numéro doit faire entre 1 et 10 caractères'),
    body('capacite')
        .isInt({ min: 1, max: 50 })
        .withMessage('La capacité doit être un nombre entre 1 et 50')
];

// Déclaration de la classe Chambre manquante
class Chambre {
    constructor(data) {
        this.id = data.id;
        this.numero = data.numero;
        this.capacite = data.capacite;
        // Ajoutez d'autres propriétés selon votre schéma de base de données
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
            const [result] = await db.execute(
                'INSERT INTO chambre (numero, capacite) VALUES (?, ?)',
                [chambreData.numero, chambreData.capacite]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette chambre existe déjà');
            }
            throw new Error('Erreur lors de la création de la chambre: ' + error.message);
        }
    }

    // Mettre à jour une chambre
    async update(chambreData) {
        try {
            await db.execute(
                'UPDATE chambre SET numero = ?, capacite = ? WHERE id = ?',
                [chambreData.numero, chambreData.capacite, this.id]
            );
            this.numero = chambreData.numero;
            this.capacite = chambreData.capacite;
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cette chambre existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour de la chambre: ' + error.message);
        }
    }

    // Supprimer une chambre
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
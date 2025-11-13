import db from './connexion.js';

class Employe {
    constructor(data) {
        this.id = data.id;
        this.nom = data.nom;
        this.age = data.age;
        this.date_recrutement = data.date_recrutement;
        this.autorisation = data.autorisation;
    }

    // Récupérer tous les employés
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM employe ORDER BY id');
            return rows.map(row => new Employe(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des employés: ' + error.message);
        }
    }

    // Récupérer un employé par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM employe WHERE id = ?', [id]);
            return rows.length > 0 ? new Employe(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de l\'employé: ' + error.message);
        }
    }

    // Créer un nouvel employé
    static async create(employeData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO employe (nom, age, date_recrutement, autorisation) VALUES (?, ?, ?, ?)',
                [employeData.nom, employeData.age, employeData.date_recrutement, employeData.autorisation]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cet employé existe déjà');
            }
            throw new Error("Erreur lors de la création de l'employé: " + error.message);
        }
    }

    // Mettre à jour un employé
    async update(employeData) {
        try {
            await db.execute(
                'UPDATE employe SET nom = ?, age = ?, date_recrutement = ?, autorisation = ? WHERE id = ?',
                [employeData.nom, employeData.age, employeData.date_recrutement, employeData.autorisation, this.id]
            );
            this.nom = employeData.nom;
            this.age = employeData.age;
            this.date_recrutement = employeData.date_recrutement;
            this.autorisation = employeData.autorisation;
            
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cet employé existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour de l\'employé: ' + error.message);
        }
    }

    // Supprimer un employé
    static async delete(id) {
        try {
            // Vérifier s'il y a des réservations associées
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservation WHERE employe_id = ?',
                [id]
            );
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer l\'employé : des réservations sont associées');
            }
            await db.execute('DELETE FROM employe WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de l\'employé: ' + error.message);
        }
    }
}

export default Employe;
import db from './connexion.js';
class Employe {
    constructor(data) {
        this.id = data.id;
        this.nom = data.numero;
        this.age = data.age;
        this.date_recrutement=data.date_recrutement;
        this.autorisation=data.autorisation;
    }
    // Récupérer toutes les chambres
    static async findAll() {
        try {
            const [rows] = await db.execute('SELECT * FROM employes ORDER BY id');
            return rows.map(row => new Chambre(row));
        } catch (error) {
            throw new Error('Erreur lors de la récupération des chambres: ' + error.message);
        }
    }
    // Récupérer un employé par ID
    static async findById(id) {
        try {
            const [rows] = await db.execute('SELECT * FROM employes WHERE id = ?', [id]);
            return rows.length > 0 ? new Employe(rows[0]) : null;
        } catch (error) {
            throw new Error('Erreur lors de la récupération de la chambre: ' + error.message);
        }
    }
    // Créer une nouvelle chambre
    static async create(employeData) {
        try {
            const [result] = await db.execute(
                'INSERT INTO employes (nom, age, date_recrutement,autorisation) VALUES (?, ?, ?, ?)',
                [employeData.nom, employeData.age,employeData.date_recrutement,employeData.autorisation]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cet employé existe déjà');
            }
            throw new Error("Erreur lors de la création de l'employé': " + error.message);
        }
    }
    // Mettre à jour une chambre
    async update(employeData) {
        try {
            await db.execute(
                'UPDATE employes SET nom = ?, age = ?, date_recrutement=?, autorisation=? WHERE id = ?',
                [employeData.nom, employeData.age,employeData.date_recrutement,employeData.autorisation,this.id]
            );
            this.nom = employeData.nom;
            this.age = employeData.age;
            this.date_recrutement=employeData.date_recrutement;
            this.autorisation=employeData.autorisation;
            
            return true;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Cet employé existe déjà');
            }
            throw new Error('Erreur lors de la mise à jour de la chambre: ' + error.message);
        }
    }
    // Supprimer une chambre
    async delete(id) {
        try {
            // Vérifier s'il y a des réservations
            const [reservations] = await db.execute(
                'SELECT COUNT(*) as count FROM reservations WHERE employe_id = ?',
                [id]
            );
            if (reservations[0].count > 0) {
                throw new Error('Impossible de supprimer la chambre des réservations sont associées');
            }
            await db.execute('DELETE FROM employes WHERE id = ?', [id]);
            return true;
        } catch (error) {
            throw new Error('Erreur lors de la suppression de la chambre: ' + error.message);
        }
    }
    // Vérifier la disponibilité d'une chambre
    
}
export default Employe;
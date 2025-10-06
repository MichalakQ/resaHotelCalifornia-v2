// Import du module mysql2 avec support des promesses
import mysql from 'mysql2';

// Fonction pour ouvrir une connexion à la base de données
// Équivalent de openDatabaseConnection() en PHP
async function openDatabaseConnection() {
    // Configuration de la connexion (équivalent des variables PHP)
    const host = 'localhost';
    const database = 'resaHotelCalifornia';
    const user = 'username';
    const password = 'password';

    try {
        // Création de la connexion 
        const conn = await mysql.createConnection({
            host: host,
            user: user,
            password: password,
            database: database,
            charset: 'utf8mb4'
        });

        console.log('Connexion à la base de données réussie');
        return conn;

    } catch (error) {
        // Gestion des erreurs (équivalent du catch PDOException en PHP)
        console.error('Erreur de connexion: ' + error.message);
        process.exit(1); // Arrête le programme
    }
}

// Fonction pour fermer la connexion à la base de données
// Équivalent de closeDatabaseConnection($conn) en PHP
async function closeDatabaseConnection(conn) {
    if (conn) {
        await conn.end(); // Ferme la connexion proprement
        console.log('Connexion fermée');
    }
}

// Export des fonctions pour les utiliser dans d'autres fichiers
export { openDatabaseConnection, closeDatabaseConnection };
// Imports needed for DB connexion
import mysql from 'mysql2/promise';
import fs from 'fs'; // FS : FileSystem (lire les fichiers du disque)
import ini from 'ini'; // INI : Lire le contenu des fichiers au format .ini
import path from 'path'; // PATH: Détermine les chemins (working dir)
import { fileURLToPath } from 'url'; // URL: Convertit les liens en chemin

// Récupérer le chemin local (file://...) et le répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lecture des paramètres depuis un fichier DB.ini (à exclure dans .gitignore)
let config;
try {
    const configPath = path.join(__dirname, '../config/DB.ini');
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    config = ini.parse(fileContent);
    
    // Vérifier que les paramètres nécessaires sont présents
    if (!config.host || !config.user || !config.password || !config.database) {
        throw new Error('Configuration DB.ini incomplète. Vérifiez que host, user, password et database sont définis.');
    }
} catch (error) {
    if (error.code === 'ENOENT') {
        console.error('❌ ERREUR: Le fichier config/DB.ini est introuvable.');
        console.error('📁 Chemin recherché:', path.join(__dirname, '../config/DB.ini'));
        console.error('💡 Solution: Créez le dossier "config" à la racine du projet et ajoutez-y le fichier DB.ini');
    } else {
        console.error('❌ ERREUR lors de la lecture de la configuration:', error.message);
    }
    process.exit(1);
}

// Configuration de la base de données
const dbConfig = {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: config.charset || 'utf8mb4' // utf8mb4 par défaut pour support complet Unicode
};

// Pool de connexions pour optimiser les performances
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tester la connexion au démarrage
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à la base de données réussie');
        console.log(`📊 Base de données: ${dbConfig.database}`);
        console.log(`🖥️  Serveur: ${dbConfig.host}`);
        connection.release();
    } catch (error) {
        console.error('❌ ERREUR de connexion à la base de données:');
        console.error('Message:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Le serveur MySQL n\'est pas accessible. Vérifiez qu\'il est démarré.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Accès refusé. Vérifiez le nom d\'utilisateur et le mot de passe dans config/DB.ini');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 La base de données n\'existe pas. Exécutez d\'abord le script SQL pour créer la base.');
        }
        
        process.exit(1);
    }
})();

// Exporte le module pool
export default pool;
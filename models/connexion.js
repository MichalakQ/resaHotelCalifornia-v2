import mysql from 'mysql2/promise';
import fs from 'fs';
import ini from 'ini';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbConfig;
try {
    const configPath = path.join(__dirname, '../config/DB.ini');
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const config = ini.parse(fileContent);
    const db = config.database; // lit la section [database]

    if (!db || !db.host || !db.user || !db.database) {
        throw new Error('Configuration DB.ini incomplète. Vérifiez que host, user, password et database sont définis.');
    }

    dbConfig = {
        host: db.host,
        user: db.user,
        password: db.password || '',
        database: db.database,
        charset: db.charset || 'utf8mb4'
    };

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error('ERREUR: Le fichier config/DB.ini est introuvable.');
    } else {
        console.error('ERREUR lors de la lecture de la configuration:', error.message);
    }
    process.exit(1);
}

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connexion à la base de données réussie');
        console.log(`Base de données: ${dbConfig.database}`);
        console.log(`Serveur: ${dbConfig.host}`);
        connection.release();
    } catch (error) {
        console.error('ERREUR de connexion à la base de données:', error.message);
        process.exit(1);
    }
})();

export default pool;
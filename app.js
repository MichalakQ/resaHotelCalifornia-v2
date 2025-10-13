import express from 'express';
import chambreRoutes from './routes/chambres.js';
import clientRoutes from './routes/clients.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home
app.get('/', (req, res) => {
  res.render('accueil', { title: 'Hôtel California - Système de Gestion' });
});

// ✅ Mount routes BEFORE 404 handler
app.use('/chambres', chambreRoutes);
app.use('/clients', clientRoutes);

// ❗ 404 handler LAST
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page non trouvée',
    error: "La page demandée n'existe pas."
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

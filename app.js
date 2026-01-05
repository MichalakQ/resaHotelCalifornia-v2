import express from 'express';
import helmet from 'helmet'; 
import chambreRoutes from './routes/chambres.js';
import clientRoutes from './routes/clients.js';
import path from 'path';
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';

//  CORRECTION #1 : Créer app AVANT de l'utiliser
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//semantic
app.use('/semantic-ui', express.static(
  path.join(__dirname, 'node_modules/semantic-ui-css')
));
// Helmet - Sécurité
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",      //  CDN Semantic UI
          "https://fonts.googleapis.com"   // Google Fonts
        ],
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net"       //  Scripts du CDN
        ],
        fontSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",      //  Fonts du CDN
          "https://fonts.gstatic.com", 
          "data:"                           //  Fonts encodées en base64
        ],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
      },
    },
  })
);
// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));  //  Maintenant app existe

// Home
app.get('/', (req, res) => {
  res.render('accueil', { title: 'Hôtel California - Système de Gestion' });
});

// Mount routes BEFORE 404 handler
app.use('/chambres', chambreRoutes);
app.use('/client', clientRoutes);

// 404 handler LAST
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page non trouvée',
    error: "La page demandée n'existe pas."
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
//          
});
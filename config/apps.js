// Routes
import chambreRoutes from './routes/chambres.js';
import clientRoutes from './routes/clients.js';
app.use('/chambres', chambreRoutes);
app.use('/clients', clientRoutes);

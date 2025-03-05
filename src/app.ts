import express from 'express';
import storeRoutes from './routes/storeRoutes';

const app = express();
app.use(express.json());
app.use('/api', storeRoutes);

export default app;
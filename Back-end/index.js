import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import './models/db.js';
import userRoutes from './routes/UsuarioRoute.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'API de Express con MySQL lista' });
});

app.use('/api/auth', userRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

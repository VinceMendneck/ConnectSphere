const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

dotenv.config();

const app = express();

// Configuração de CORS simplificada
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Log de inicialização
console.log('Iniciando o servidor Express...');

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Rota de teste
app.get('/test', (req, res) => {
  console.log('Rota /test acessada');
  res.json({ message: 'Backend está funcionando' });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erro no servidor:`, err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Erro ao iniciar o servidor na porta ${PORT}:`, err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
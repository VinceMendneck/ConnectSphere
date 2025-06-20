const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const path = require('path');
const fs = require('fs').promises;
const { PrismaClient } = require('@prisma/client');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('Erro: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:4173', 'https://connectsphere-frontend.onrender.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const uploadDir = path.join(__dirname, 'Uploads');

(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error(`Erro ao criar diretório ${uploadDir}:`, err);
    process.exit(1);
  }
})();

app.use('/uploads', express.static(uploadDir));

console.log('Iniciando o servidor Express...');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Inicializando PrismaClient...');
    await prisma.$connect();
    console.log('PrismaClient inicializado com sucesso');
    // Verifica se o campo avatarData existe na tabela User
    const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'avatarData';`;
    console.log('Campo avatarData existe na tabela User:', columns.length > 0 ? 'Sim' : 'Não');
  } catch (error) {
    console.error('Erro ao inicializar PrismaClient:', error);
    process.exit(1);
  }
})();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

app.get('/test', (req, res) => {
  console.log('Rota /test acessada');
  res.json({ message: 'Backend está funcionando' });
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erro no servidor:`, err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message === 'Apenas imagens são permitidas') {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes('Origem não permitida')) {
    return res.status(403).json({ error: 'Acesso negado pelo CORS' });
  }

  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Erro ao iniciar o servidor na porta ${PORT}:`, err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

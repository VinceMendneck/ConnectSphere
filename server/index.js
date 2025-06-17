const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const path = require('path');
const fs = require('fs').promises; // Use fs.promises para operações assíncronas

dotenv.config();

// Verifica se JWT_SECRET está definido
if (!process.env.JWT_SECRET) {
  console.error('Erro: JWT_SECRET não está definido no arquivo .env');
  process.exit(1);
}

const app = express();

// Configuração do CORS
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173'];

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

// Configuração do diretório de uploads
const uploadDir = path.join(__dirname, 'Uploads');
const defaultAvatarPath = path.join(uploadDir, 'default-avatar.png');

(async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    // Verifica se default-avatar.png existe; se não, loga um aviso
    try {
      await fs.access(defaultAvatarPath);
    } catch {
      console.warn(`Aviso: default-avatar.png não encontrado em ${uploadDir}. Crie o arquivo para suportar placeholders de avatar.`);
    }
  } catch (err) {
    console.error(`Erro ao criar diretório ${uploadDir}:`, err);
    process.exit(1);
  }
})();

app.use('/uploads', express.static(uploadDir));

console.log('Iniciando o servidor Express...');

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers.origin || 'unknown'}`);
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.get('/test', (req, res) => {
  console.log('Rota /test acessada');
  res.json({ message: 'Backend está funcionando' });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Erro no servidor:`, err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 15MB.' });
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
  console.log(`Uploads disponíveis em: http://localhost:${PORT}/uploads`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
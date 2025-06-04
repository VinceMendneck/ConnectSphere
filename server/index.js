const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rota de registro
app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, username }
    });
    res.status(201).json({ message: 'Usuário criado', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar usuário' });
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Rota de criação de post
app.post('/posts', async (req, res) => {
  const { content, image } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const post = await prisma.post.create({
      data: { content, image, userId }
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Outras rotas (curtidas, comentários, etc.) podem ser adicionadas aqui

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
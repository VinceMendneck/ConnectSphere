// client/server/index.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token necessário' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { posts: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      posts: user.posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// GET /api/posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: true, likes: true },
    });
    res.json(posts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: { id: post.user.id, username: post.user.username },
      likes: post.likes.length,
      likedBy: post.likes.map(like => like.userId),
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar posts' });
  }
});

// POST /api/posts
app.post('/api/posts', authenticateToken, async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Conteúdo é obrigatório' });
  }

  try {
    const post = await prisma.post.create({
      data: {
        content,
        userId: req.user.id,
      },
      include: { user: true },
    });
    res.status(201).json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      user: { id: post.user.id, username: post.user.username },
      likes: 0,
      likedBy: [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar post' });
  }
});

// POST /api/posts/:id/like
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    const existingLike = await prisma.like.findFirst({
      where: { userId, postId: parseInt(id) },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      const likes = await prisma.like.findMany({ where: { postId: parseInt(id) } });
      res.json({ likes: likes.length, likedBy: likes.map(like => like.userId) });
    } else {
      await prisma.like.create({
        data: { userId, postId: parseInt(id) },
      });
      const likes = await prisma.like.findMany({ where: { postId: parseInt(id) } });
      res.json({ likes: likes.length, likedBy: likes.map(like => like.userId) });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao curtir/descurtir post' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
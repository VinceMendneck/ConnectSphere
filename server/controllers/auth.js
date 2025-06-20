const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { email, username, password } = req.body;
  console.log('Recebida requisição de registro:', { email, username });
  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      console.log('Email já registrado:', email);
      return res.status(400).json({ error: 'Email já registrado' });
    }
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      console.log('Username já registrado:', username);
      return res.status(400).json({ error: 'Username já existe' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
    console.log('Usuário registrado com sucesso:', { id: user.id, username: user.username });
    res.status(201).json({ id: user.id, username: user.username, email: user.email });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    if (error.code === 'P2002') {
      const field = error.meta?.target.includes('email') ? 'Email' : 'Username';
      return res.status(400).json({ error: `${field} já registrado` });
    }
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Recebida requisição de login:', { email });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('Email não registrado:', email);
      return res.status(400).json({ error: 'Email não registrado' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Senha inválida para:', email);
      return res.status(400).json({ error: 'Senha inválida' });
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Login bem-sucedido:', { userId: user.id, username: user.username });
    res.json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error('Erro ao fazer login:', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar: true,
      },
    });
    if (!user) {
      console.log('Usuário não encontrado:', { userId: req.user.id });
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.log('Dados do usuário retornados:', user);
    res.json({
      ...user,
      avatar: user.avatar ? `http://localhost:5000/${user.avatar}` : null,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

module.exports = { register, login, getCurrentUser };
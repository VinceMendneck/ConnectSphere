const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Configuração do Multer para armazenar em memória (não no disco)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'), false);
    }
  },
}).single('avatar');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = { id: decoded.userId, username: decoded.username };
    console.log('Usuário autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Erro na validação do token:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { posts: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatarData ? `data:image/jpeg;base64,${user.avatarData.toString('base64')}` : `${process.env.BACKEND_URL || 'http://localhost:5000'}/Uploads/default-avatar.png`,
      posts: user.posts,
      followers: await prisma.follows.count({ where: { followingId: parseInt(id) } }),
      following: await prisma.follows.count({ where: { followerId: parseInt(id) } }),
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  let { bio } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { posts: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (user.id !== userId) return res.status(403).json({ error: 'Permissão negada' });

    if (bio) {
      bio = bio.trim().slice(0, 160);
      if (bio.length === 0) bio = null;
    }

    let avatarData = user.avatarData;

    if (req.file) {
      avatarData = req.file.buffer; // Armazena o buffer da imagem
      console.log('Novo avatar recebido, tamanho:', avatarData.length);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        bio: bio || user.bio,
        avatarData: req.file ? avatarData : user.avatarData, // Atualiza apenas se novo arquivo for enviado
        avatar: null, // Limpa o campo avatar, já que usamos avatarData
      },
      include: { posts: true },
    });

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatarData ? `data:image/jpeg;base64,${updatedUser.avatarData.toString('base64')}` : `${process.env.BACKEND_URL || 'http://localhost:5000'}/Uploads/default-avatar.png`,
      posts: updatedUser.posts,
      followers: await prisma.follows.count({ where: { followingId: parseInt(id) } }),
      following: await prisma.follows.count({ where: { followerId: parseInt(id) } }),
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar perfil' });
  }
};

const followUser = async (req, res) => {
  const { id } = req.params;
  const followerId = req.user.id;
  if (parseInt(id) === followerId) return res.status(400).json({ error: 'Não pode seguir a si mesmo' });
  try {
    const existingFollow = await prisma.follows.findUnique({
      where: { followerId_followingId: { followerId, followingId: parseInt(id) } },
    });
    if (existingFollow) {
      await prisma.follows.delete({
        where: { followerId_followingId: { followerId, followingId: parseInt(id) } },
      });
      res.json({ message: 'Deixou de seguir' });
    } else {
      await prisma.follows.create({ data: { followerId, followingId: parseInt(id) } });
      res.json({ message: 'Seguindo' });
    }
  } catch (error) {
    console.error('Erro ao seguir/deseguir:', error);
    res.status(500).json({ error: 'Erro ao seguir/deseguir usuário' });
  }
};

const getFollowers = async (req, res) => {
  const { id } = req.params;
  try {
    const followers = await prisma.follows.findMany({
      where: { followingId: parseInt(id) },
      include: { follower: true },
    });
    res.json(followers.map(f => ({ id: f.follower.id, username: f.follower.username, email: f.follower.email })));
  } catch (error) {
    console.error('Erro ao listar seguidores:', error);
    res.status(500).json({ error: 'Erro ao listar seguidores' });
  }
};

const getFollowing = async (req, res) => {
  const { id } = req.params;
  try {
    const following = await prisma.follows.findMany({
      where: { followerId: parseInt(id) },
      include: { following: true },
    });
    res.json(following.map(f => ({ id: f.following.id, username: f.following.username, email: f.following.email })));
  } catch (error) {
    console.error('Erro ao listar seguidos:', error);
    res.status(500).json({ error: 'Erro ao listar seguidos' });
  }
};

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 15MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Apenas imagens são permitidas') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

module.exports = { getUser, updateUser, followUser, getFollowers, getFollowing, authenticate, upload, handleMulterError };
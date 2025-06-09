// server/controllers/users.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getUser = async (req, res) => {
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
      bio: user.bio,
      avatar: user.avatar,
      posts: user.posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { bio, avatar } = req.body;
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({ error: 'Acesso não autorizado' });
  }
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { bio, avatar },
    });
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

const followUser = async (req, res) => {
  const { id } = req.params;
  const followerId = req.user.id;
  if (parseInt(id) === followerId) {
    return res.status(400).json({ error: 'Não pode seguir a si mesmo' });
  }
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
      await prisma.follows.create({
        data: { followerId, followingId: parseInt(id) },
      });
      res.json({ message: 'Seguindo' });
    }
  } catch (error) {
    console.error(error);
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
    res.json(followers.map(f => ({
      id: f.follower.id,
      username: f.follower.username,
      email: f.follower.email,
    })));
  } catch (error) {
    console.error(error);
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
    res.json(following.map(f => ({
      id: f.following.id,
      username: f.following.username,
      email: f.following.email,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar seguidos' });
  }
};

module.exports = { getUser, updateUser, followUser, getFollowers, getFollowing };
// server/controllers/posts.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { user: true, likes: true },
      orderBy: { createdAt: 'desc' },
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
};

const createPost = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  try {
    const post = await prisma.post.create({
      data: {
        content,
        userId,
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
};

const toggleLike = async (req, res) => {
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
};

const getPostsByHashtag = async (req, res) => {
  const { tag } = req.params;
  try {
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: `#${tag}`,
          mode: 'insensitive',
        },
      },
      include: { user: true, likes: true },
      orderBy: { createdAt: 'desc' },
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
    res.status(500).json({ error: 'Erro ao listar posts por hashtag' });
  }
};

module.exports = { getPosts, createPost, toggleLike, getPostsByHashtag };
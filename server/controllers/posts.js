const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        likes: true,
        comments: {
          include: {
            user: true,
            likes: true,
            replies: { include: { user: true, likes: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(
      posts.map(post => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        user: { id: post.user.id, username: post.user.username },
        likes: post.likes.length,
        likedBy: post.likes.map(like => like.userId),
        images: post.images ? post.images.map(img => `http://localhost:5000/${img}`) : [],
        comments: post.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          user: { id: comment.user.id, username: comment.user.username },
          postId: comment.postId,
          parentId: comment.parentId,
          likes: comment.likes.length,
          likedBy: comment.likes.map(like => like.userId),
          replies: comment.replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            user: { id: reply.user.id, username: reply.user.username },
            likes: reply.likes.length,
            likedBy: reply.likes.map(like => like.userId),
            createdAt: reply.createdAt,
          })),
          createdAt: comment.createdAt,
        })),
      }))
    );
  } catch (error) {
    console.error('Erro ao listar posts:', error);
    res.status(500).json({ error: 'Erro ao listar posts' });
  }
};

const createPost = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;
  const images = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];
  console.log('createPost - Dados recebidos:', { content, userId, images });
  try {
    const post = await prisma.post.create({
      data: {
        content,
        userId,
        images: images.length > 0 ? images : null,
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
      images: post.images ? post.images.map(img => `http://localhost:5000/${img}`) : [],
      comments: [],
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
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
    console.error('Erro ao curtir/descurtir post:', error);
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
        },
      },
      include: {
        user: true,
        likes: true,
        comments: {
          include: {
            user: true,
            likes: true,
            replies: { include: { user: true, likes: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log('Posts encontrados para #', tag, ':', posts);
    if (!posts || posts.length === 0) {
      return res.status(200).json([]);
    }
    res.json(
      posts.map(post => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        user: { id: post.user.id, username: post.user.username },
        likes: post.likes.length,
        likedBy: post.likes.map(like => like.userId),
        images: post.images ? post.images.map(img => `http://localhost:5000/${img}`) : [],
        comments: post.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          user: { id: comment.user.id, username: comment.user.username },
          postId: comment.postId,
          parentId: comment.parentId,
          likes: comment.likes.length,
          likedBy: comment.likes.map(like => like.userId),
          replies: comment.replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            user: { id: reply.user.id, username: reply.user.username },
            likes: reply.likes.length,
            likedBy: reply.likes.map(like => like.userId),
            createdAt: reply.createdAt,
          })),
          createdAt: comment.createdAt,
        })),
      }))
    );
  } catch (error) {
    console.error('Erro ao buscar posts por hashtag:', error);
    res.status(500).json({ error: 'Erro ao listar posts por hashtag' });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });
    if (!post) {
      console.log('Post não encontrado:', { postId: id });
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    if (post.userId !== userId) {
      console.log('Usuário não autorizado:', { userId, postUserId: post.userId });
      return res.status(403).json({ error: 'Você não tem permissão para excluir este post' });
    }

    // Excluir likes dos comentários e suas replies
    const commentIds = await prisma.comment.findMany({
      where: { postId: parseInt(id) },
      select: { id: true },
    }).then(comments => comments.map(c => c.id));

    if (commentIds.length > 0) {
      await prisma.commentLike.deleteMany({
        where: { commentId: { in: commentIds } },
      });
      await prisma.comment.deleteMany({
        where: { parentId: { in: commentIds } },
      });
      await prisma.comment.deleteMany({
        where: { id: { in: commentIds } },
      });
    }

    // Excluir likes do post
    await prisma.like.deleteMany({ where: { postId: parseInt(id) } });

    // Excluir o post
    await prisma.post.delete({ where: { id: parseInt(id) } });

    console.log('Post excluído com sucesso:', { postId: id });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    res.status(500).json({ error: 'Erro ao excluir post' });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  const images = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];
  const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
  const removedImages = req.body.removedImages ? JSON.parse(req.body.removedImages) : [];

  console.log('updatePost - Dados recebidos:', { content, userId, images, existingImages, removedImages });
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este post' });
    }

    const validExistingImages = existingImages.map(img => img.replace('http://localhost:5000/', ''));
    console.log('Valid existing images:', validExistingImages);

    let remainingImages = validExistingImages;
    if (removedImages.length > 0) {
      remainingImages = validExistingImages.filter((img, i) => {
        console.log(`Checking index ${i}: removed? ${removedImages.includes(i)}`);
        return !removedImages.includes(i);
      });
    }
    console.log('Remaining images after removal:', remainingImages);

    const allImages = [...remainingImages, ...images];
    console.log('AllImages antes da atualização:', allImages);

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        content: content || post.content,
        images: allImages.length > 0 ? allImages : post.images,
      },
      include: { user: true, likes: true },
    });

    console.log('UpdatedPost.images após atualização:', updatedPost.images);
    res.json({
      id: updatedPost.id,
      content: updatedPost.content,
      createdAt: updatedPost.createdAt,
      user: { id: updatedPost.user.id, username: updatedPost.user.username },
      likes: updatedPost.likes.length,
      likedBy: updatedPost.likes.map(like => like.userId),
      images: updatedPost.images ? updatedPost.images.map(img => `http://localhost:5000/${img}`) : [],
    });
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    res.status(500).json({ error: 'Erro ao atualizar post' });
  }
};

module.exports = { getPosts, createPost, toggleLike, getPostsByHashtag, deletePost, updatePost };
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createComment = async (req, res) => {
  const { postId, content, parentId } = req.body;
  const userId = req.user.id;
  console.log('createComment - Dados recebidos:', { postId, content, parentId, userId });
  try {
    if (!content?.trim()) {
      console.log('Erro: Conteúdo do comentário vazio');
      return res.status(400).json({ error: 'O comentário deve ter conteúdo' });
    }
    const post = await prisma.post.findUnique({ where: { id: parseInt(postId) } });
    if (!post) {
      console.log('Erro: Post não encontrado', { postId });
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parseInt(parentId) } });
      if (!parent) {
        console.log('Erro: Comentário pai não encontrado', { parentId });
        return res.status(404).json({ error: 'Comentário pai não encontrado' });
      }
    }
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        postId: parseInt(postId),
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: { 
        user: true, 
        likes: true, 
        replies: { include: { user: true, likes: true } } 
      },
    });
    console.log('Comentário criado:', comment.id);
    res.status(201).json({
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
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
};

const toggleCommentLike = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log('toggleCommentLike - Dados recebidos:', { commentId: id, userId });
  try {
    const comment = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
    if (!comment) {
      console.log('Erro: Comentário não encontrado', { commentId: id });
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    const existingLike = await prisma.commentLike.findFirst({
      where: { userId, commentId: parseInt(id) },
    });
    if (existingLike) {
      await prisma.commentLike.delete({ where: { id: existingLike.id } });
      const likes = await prisma.commentLike.findMany({ where: { commentId: parseInt(id) } });
      console.log('Curtida removida:', { commentId: id, likes: likes.length });
      res.json({ likes: likes.length, likedBy: likes.map(like => like.userId) });
    } else {
      await prisma.commentLike.create({
        data: { userId, commentId: parseInt(id) },
      });
      const likes = await prisma.commentLike.findMany({ where: { commentId: parseInt(id) } });
      console.log('Curtida adicionada:', { commentId: id, likes: likes.length });
      res.json({ likes: likes.length, likedBy: likes.map(like => like.userId) });
    }
  } catch (error) {
    console.error('Erro ao curtir/descurtir comentário:', error);
    res.status(500).json({ error: 'Erro ao curtir/descurtir comentário' });
  }
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  console.log('updateComment - Dados recebidos:', { commentId: id, content, userId });
  try {
    if (!content?.trim()) {
      console.log('Erro: Conteúdo do comentário vazio');
      return res.status(400).json({ error: 'O comentário deve ter conteúdo' });
    }
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, likes: true, replies: { include: { user: true, likes: true } } },
    });
    if (!comment) {
      console.log('Erro: Comentário não encontrado', { commentId: id });
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    if (comment.userId !== userId) {
      console.log('Erro: Usuário não autorizado', { userId, commentUserId: comment.userId });
      return res.status(403).json({ error: 'Você não tem permissão para editar este comentário' });
    }
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content: content.trim() },
      include: { user: true, likes: true, replies: { include: { user: true, likes: true } } },
    });
    console.log('Comentário atualizado:', updatedComment.id);
    res.json({
      id: updatedComment.id,
      content: updatedComment.content,
      user: { id: updatedComment.user.id, username: updatedComment.user.username },
      postId: updatedComment.postId,
      parentId: updatedComment.parentId,
      likes: updatedComment.likes.length,
      likedBy: updatedComment.likes.map(like => like.userId),
      replies: updatedComment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        user: { id: reply.user.id, username: reply.user.username },
        likes: reply.likes.length,
        likedBy: reply.likes.map(like => like.userId),
        createdAt: reply.createdAt,
      })),
      createdAt: updatedComment.createdAt,
    });
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ error: 'Erro ao atualizar comentário' });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log('deleteComment - Dados recebidos:', { commentId: id, userId });
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, post: true }, // Inclua o post para verificar o dono
    });
    if (!comment) {
      console.log('Erro: Comentário não encontrado', { commentId: id });
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }
    if (comment.userId !== userId && comment.post.userId !== userId) {
      console.log('Erro: Usuário não autorizado', { userId, commentUserId: comment.userId, postOwnerId: comment.post.userId });
      return res.status(403).json({ error: 'Você não tem permissão para excluir este comentário' });
    }
    await prisma.commentLike.deleteMany({ where: { commentId: parseInt(id) } });
    await prisma.comment.deleteMany({ where: { parentId: parseInt(id) } });
    await prisma.comment.delete({ where: { id: parseInt(id) } });
    console.log('Comentário excluído:', id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    res.status(500).json({ error: 'Erro ao excluir comentário' });
  }
};

// Verificar exportações
console.log('Exportações em controllers/comments.js:', {
  createComment: typeof createComment,
  toggleCommentLike: typeof toggleCommentLike,
  updateComment: typeof updateComment,
  deleteComment: typeof deleteComment
});

module.exports = { createComment, toggleCommentLike, updateComment, deleteComment };
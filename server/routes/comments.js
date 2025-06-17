const express = require('express');
const router = express.Router();
const { createComment, toggleCommentLike, updateComment, deleteComment } = require('../controllers/comments');
const { authenticateToken } = require('../middleware/auth');

// Verificar se as funções foram importadas corretamente
console.log('Importações em routes/comments.js:', {
  createComment: typeof createComment,
  toggleCommentLike: typeof toggleCommentLike,
  updateComment: typeof updateComment,
  deleteComment: typeof deleteComment,
  authenticateToken: typeof authenticateToken
});

router.post('/', authenticateToken, createComment);
router.post('/:id/like', authenticateToken, toggleCommentLike);
router.put('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);

module.exports = router;
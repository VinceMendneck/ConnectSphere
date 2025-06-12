const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLike, getPostsByHashtag, deletePost, updatePost } = require('../controllers/posts');
const upload = require('../multerConfig');
const { authenticateToken } = require('../middleware/auth');

router.get('/', getPosts);
router.post('/', authenticateToken, upload.array('images', 4), createPost);
router.post('/:id/like', authenticateToken, toggleLike);
router.get('/hashtag/:tag', getPostsByHashtag);
router.delete('/:id', authenticateToken, deletePost);
router.put('/:id', authenticateToken, upload.array('images', 4), updatePost);

module.exports = router;
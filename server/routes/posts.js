// server/routes/posts.js
const express = require('express');
const { getPosts, createPost, toggleLike, getPostsByHashtag } = require('../controllers/posts');
const { authenticateToken } = require('../middleware/auth');
const { validateCreatePost } = require('../middleware/validation');

const router = express.Router();

router.get('/', getPosts);
router.post('/', authenticateToken, validateCreatePost, createPost);
router.post('/:id/like', authenticateToken, toggleLike);
router.get('/hashtags/:tag', getPostsByHashtag);

module.exports = router;
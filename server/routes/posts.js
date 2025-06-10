const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLike, getPostsByHashtag } = require('../controllers/posts');
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get('/', getPosts);
router.post('/', authenticateToken, upload.single('image'), createPost);
router.post('/:id/like', authenticateToken, toggleLike);
router.get('/hashtag/:tag', getPostsByHashtag);

module.exports = router;
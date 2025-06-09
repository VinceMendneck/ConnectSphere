// server/routes/users.js
const express = require('express');
const { getUser, updateUser, followUser, getFollowers, getFollowing } = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');
const { validateUpdateUser } = require('../middleware/validation');

const router = express.Router();

router.get('/:id', getUser);
router.put('/:id', authenticateToken, validateUpdateUser, updateUser);
router.post('/:id/follow', authenticateToken, followUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
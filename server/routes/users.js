const express = require('express');
const router = express.Router();
const { getUser, updateUser, followUser, getFollowers, getFollowing, authenticate, upload, handleMulterError } = require('../controllers/users');

router.get('/:id', getUser);
router.put('/:id', authenticate, upload, handleMulterError, updateUser);
router.post('/:id/follow', authenticate, followUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
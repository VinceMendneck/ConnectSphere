const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
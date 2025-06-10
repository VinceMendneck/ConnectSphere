const express = require('express');
const router = express.Router();

// Importações
let getUser, updateUser, followUser, getFollowers, getFollowing, validateUpdateUser;
try {
  ({ getUser, updateUser, followUser, getFollowers, getFollowing } = require('../controllers/users'));
  ({ validateUpdateUser } = require('../middleware/validation'));
  console.log('Importações bem-sucedidas:', {
    getUser: !!getUser,
    updateUser: !!updateUser,
    followUser: !!followUser,
    getFollowers: !!getFollowers,
    getFollowing: !!getFollowing,
    validateUpdateUser: !!validateUpdateUser,
  });
} catch (error) {
  console.error('Erro ao importar dependências:', error);
  throw error;
}

// Rotas
router.get('/:id', getUser);
// router.put('/:id', validateUpdateUser, updateUser); // Comentar para evitar erro de authenticateToken
router.post('/:id/follow', followUser); // Linha 27: Removido authenticateToken temporariamente
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;
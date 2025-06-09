// server/middleware/validation.js
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const updateUserSchema = z.object({
  bio: z.string().optional(),
  avatar: z.string().url('URL de avatar inválida').optional(),
});

const createPostSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório').max(280, 'Conteúdo deve ter no máximo 280 caracteres'),
});

const validateRegister = (req, res, next) => {
  try {
    registerSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

const validateLogin = (req, res, next) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

const validateUpdateUser = (req, res, next) => {
  try {
    updateUserSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

const validateCreatePost = (req, res, next) => {
  try {
    createPostSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateCreatePost,
};
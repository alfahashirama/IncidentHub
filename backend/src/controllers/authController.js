const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { usersRegistered } = require('../utils/metrics');

/**
 * @route   POST /api/auth/register
 * @desc    Créer un nouveau compte utilisateur
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // Validation basique
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please provide all required fields'
      });
    }
    
    // Vérifie si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email already in use'
      });
    }
    
    // Crée l'utilisateur (le password sera hashé automatiquement par le hook)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'agent' // Par défaut : agent
    });
    
    // Génère le token JWT
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(), // Exclut le password grâce à la méthode toJSON()
        token
      }
    });
    
    usersRegistered.inc();

  } catch (error) {
    console.error('Register error:', error);
    
    // Gestion des erreurs de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred during registration'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authentifier un utilisateur
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation basique
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Please provide email and password'
      });
    }
    
    // Récupère l'utilisateur avec le password (nécessaire pour la comparaison)
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }
    
    // Vérifie le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid credentials'
      });
    }
    
    // Vérifie que le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Account is inactive'
      });
    }
    
    // Génère le token JWT
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred during login'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir les informations de l'utilisateur connecté
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // req.user est déjà défini par le middleware protect
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'An error occurred while fetching user data'
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
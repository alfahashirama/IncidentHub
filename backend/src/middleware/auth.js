const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Middleware de protection des routes
 * Vérifie la présence et la validité du token JWT
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Récupère le token depuis le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Vérifie que le token existe
    if (!token) {
      return res.status(401).json({
        error: 'Not authorized to access this route',
        message: 'No token provided'
      });
    }
    
    // Vérifie et décode le token
    const decoded = verifyToken(token);
    
    // Récupère l'utilisateur depuis la DB (sans le password)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    // Vérifie que l'utilisateur existe et est actif
    if (!user) {
      return res.status(401).json({
        error: 'Not authorized',
        message: 'User not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Not authorized',
        message: 'User account is inactive'
      });
    }
    
    // Attache l'utilisateur à la requête
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Not authorized',
      message: error.message
    });
  }
};

/**
 * Middleware de vérification des rôles
 * Vérifie que l'utilisateur a l'un des rôles autorisés
 * @param  {...String} roles - Liste des rôles autorisés
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user est déjà défini par le middleware protect
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
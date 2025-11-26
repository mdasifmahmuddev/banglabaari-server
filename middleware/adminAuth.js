const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Admin access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        status: 'error',
        message: 'Access denied. Admin privileges required.' 
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      status: 'error',
      message: 'Invalid or expired admin token.' 
    });
  }
};

module.exports = adminAuthMiddleware;
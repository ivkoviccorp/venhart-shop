const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Zaštiti rute - samo ulogovani
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Niste autorizovani za pristup'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hardcoded admin provera
    if (decoded.id === 'admin-hardcoded') {
      req.user = {
        _id: 'admin-hardcoded',
        id: 'admin-hardcoded',
        name: 'Venhart Admin',
        email: 'admin@venhart.com',
        role: 'admin'
      };
      return next();
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Korisnik ne postoji'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Niste autorizovani za pristup'
    });
  }
};

// Samo admin
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Nemate admin privilegije'
    });
  }
  next();
};
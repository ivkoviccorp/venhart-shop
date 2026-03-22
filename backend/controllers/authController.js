const User = require('../models/User');

// @desc    Registruj admina (koristićemo jednom)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    // Proveri admin secret za kreiranje admin naloga
    let role = 'customer';
    if (adminSecret === process.env.JWT_SECRET) {
      role = 'admin';
    }

    // Proveri da li korisnik već postoji
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Korisnik sa ovim emailom već postoji'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Unesite email i lozinku'
      });
    }

    // ===== HARDCODED ADMIN LOGIN - DODATO =====
    if (email === 'admin@venhart.com' && password === 'Venhart2026') {
      return res.json({
        success: true,
        token: 'admin-hardcoded-token-venhart-2024',
        user: {
          id: 'admin-hardcoded',
          name: 'Venhart Admin',
          email: 'admin@venhart.com',
          role: 'admin'
        }
      });
    }
    // ===== KRAJ HARDCODED ADMIN =====

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pogrešni podaci za prijavu'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Pogrešni podaci za prijavu'
      });
    }

    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
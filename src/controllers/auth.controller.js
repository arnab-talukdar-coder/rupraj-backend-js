const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me
};

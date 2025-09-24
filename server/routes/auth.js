const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2b$10$PlxZ7f60NC674r1FUUgoOOKgvtMsUCTbxbu/mcXVAHX3bMGkzryzq', // password: admin123
    role: 'admin',
    fullName: 'System Administrator'
  },
  {
    id: 2,
    username: 'hr_manager',
    password: '$2b$10$PlxZ7f60NC674r1FUUgoOOKgvtMsUCTbxbu/mcXVAHX3bMGkzryzq', // password: admin123
    role: 'hr',
    fullName: 'HR Manager'
  }
];

router.post('/login',
  [
    body('username').notEmpty().trim().escape(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = users.find(u => u.username === username);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/validate-token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);

    if (user) {
      res.json({
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName
        }
      });
    } else {
      res.json({ valid: false });
    }
  } catch (err) {
    res.json({ valid: false });
  }
});

module.exports = router;
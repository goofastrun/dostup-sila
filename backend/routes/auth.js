const express = require('express');
const router = express.Router();
const { pool } = require('../db/init');

router.post('/register', async (req, res) => {
  const { email, password, name, birthDate, gender, role, department } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password, name, birth_date, gender, role, department) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [email, password, name, birthDate, gender, role, department]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Неверный email или пароль' });
    }
  } catch (error) {
    console.error('Ошибка при попытке входа:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
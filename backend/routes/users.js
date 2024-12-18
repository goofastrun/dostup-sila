const express = require('express');
const router = express.Router();
const { pool } = require('../db/init');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE role != $1', ['admin']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/role', async (req, res) => {
  const { role, department } = req.body;
  try {
    let query = 'UPDATE users SET role = $1';
    const params = [role];
    
    if (department) {
      query += ', department = $2';
      params.push(department);
    }
    
    query += ' WHERE id = $' + (params.length + 1) + ' RETURNING *';
    params.push(req.params.id);
    
    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, email, birth_date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, birth_date = $3 WHERE id = $4 RETURNING *',
      [name, email, birth_date, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
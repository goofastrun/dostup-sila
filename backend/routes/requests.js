const express = require('express');
const router = express.Router();
const { pool } = require('../db/init');

// Create a new request
router.post('/', async (req, res) => {
  try {
    const { topic, message, authorId } = req.body;
    const result = await pool.query(
      'INSERT INTO requests (topic, message, author_id) VALUES ($1, $2, $3) RETURNING *',
      [topic, message, authorId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get all requests (for admins and managers)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as author_name, u.department as author_department 
      FROM requests r 
      JOIN users u ON r.author_id = u.id 
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

module.exports = router;
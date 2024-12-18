const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../db/init');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req, res) => {
  const { content, department, authorId } = req.body;
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  try {
    const result = await pool.query(
      'INSERT INTO posts (content, department, author_id, file_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [content, department, authorId, file_url]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const { department, role } = req.query;
  try {
    let query = 'SELECT posts.*, users.name as author_name FROM posts LEFT JOIN users ON posts.author_id = users.id';
    const params = [];
    
    if (role !== 'admin' && role !== 'manager') {
      if (department) {
        query += ' WHERE (posts.department = $1 OR posts.department = \'Для всех\')';
        params.push(department);
      }
    }
    
    query += ' ORDER BY created_at DESC';
    
    console.log('Executing query:', query, 'with params:', params);
    console.log('Department:', department, 'Role:', role);
    
    const result = await pool.query(query, params);
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
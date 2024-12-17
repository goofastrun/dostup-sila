const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { pool, initDB } = require('./db/init');

const app = express();
app.use(cors());
app.use(express.json());

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Создаем папку uploads если её нет
const fs = require('fs');
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

// Раздача статических файлов
app.use('/uploads', express.static('uploads'));

app.post('/api/register', async (req, res) => {
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

// Авторизация
app.post('/api/login', async (req, res) => {
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
    res.status(500).json({ error: error.message });
  }
});

// Получение списка пользователей
app.get('/api/users', async (req, res) => {
  try {
    // Only return users with role 'user', excluding managers and admins
    const result = await pool.query('SELECT * FROM users WHERE role = $1', ['user']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удаление пользователя
app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление роли пользователя
app.put('/api/users/:id/role', async (req, res) => {
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

// Создание записи с файлом
app.post('/api/posts', upload.single('file'), async (req, res) => {
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

// Получение записей
app.get('/api/posts', async (req, res) => {
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

// Обновление профиля пользователя
app.put('/api/users/:id', async (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initDB().catch(console.error);
});

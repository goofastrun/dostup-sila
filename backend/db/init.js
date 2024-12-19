const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const connectWithRetry = async () => {
  let retries = 5;
  while (retries) {
    try {
      const client = await pool.connect();
      console.log('Successfully connected to database');
      client.release();
      return true;
    } catch (err) {
      console.log(`Failed to connect to database. Retries left: ${retries}`);
      retries -= 1;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  return false;
};

const checkTableExists = async (client, tableName) => {
  const result = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `, [tableName]);
  return result.rows[0].exists;
};

const initDB = async () => {
  try {
    const connected = await connectWithRetry();
    if (!connected) {
      throw new Error('Failed to connect to database after multiple retries');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const usersExists = await checkTableExists(client, 'users');
      const postsExists = await checkTableExists(client, 'posts');

      if (!usersExists) {
        console.log('Creating users table...');
        await client.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            birth_date DATE NOT NULL,
            gender VARCHAR(50) NOT NULL,
            role VARCHAR(50) NOT NULL,
            department VARCHAR(255)
          );
        `);
      }

      if (!postsExists) {
        console.log('Creating posts table...');
        await client.query(`
          CREATE TABLE posts (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            department VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            author_id INTEGER REFERENCES users(id),
            file_url VARCHAR(255)
          );
        `);
      }

      await client.query('COMMIT');
      console.log('Database initialized successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

module.exports = { pool, initDB };
import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = getPool();
  const result = await client.query(text, params);
  return result;
}

export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS images (
      image_id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
      image_name VARCHAR(100) NOT NULL,
      image_path VARCHAR(500) NOT NULL,
      description TEXT,
      upload_date TIMESTAMP DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS persons (
      person_id SERIAL PRIMARY KEY,
      person_name VARCHAR(100) UNIQUE NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tags (
      tag_id SERIAL PRIMARY KEY,
      tag_name VARCHAR(100) UNIQUE NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS image_person (
      id SERIAL PRIMARY KEY,
      image_id INT REFERENCES images(image_id) ON DELETE CASCADE,
      person_id INT REFERENCES persons(person_id) ON DELETE CASCADE,
      UNIQUE(image_id, person_id)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS image_tag (
      id SERIAL PRIMARY KEY,
      image_id INT REFERENCES images(image_id) ON DELETE CASCADE,
      tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
      UNIQUE(image_id, tag_id)
    );
  `);

  return true;
}

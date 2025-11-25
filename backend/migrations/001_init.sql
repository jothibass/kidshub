CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS children (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  name TEXT NOT NULL,
  age INT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  child_id INT REFERENCES children(id),
  title TEXT,
  author TEXT,
  pages INT,
  read_date DATE
);

CREATE TABLE IF NOT EXISTS progress (
  id SERIAL PRIMARY KEY,
  child_id INT REFERENCES children(id),
  type TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT now()
);

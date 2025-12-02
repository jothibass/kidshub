import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
const router = express.Router();

// Simple signup (no email verification, for demo)
router.post('/signup', async (req,res)=>{
  const { email, password, name, role='parent' } = req.body;
  if(!email||!password) return res.status(400).json({ error: 'missing' });
  const hashed = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try{
    const q = 'INSERT INTO users (email,password_hash,role,name) VALUES ($1,$2,$3,$4) RETURNING id,email,role,name';
    const r = await client.query(q,[email,hashed,role,name]);
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({ error: 'db' }) } finally{ client.release() }
});

// Simple login (returns dummy token; integrate JWT for production)
router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  if(!email||!password) return res.status(400).json({ error:'missing' });
  const client = await pool.connect();
  try{
    const r = await client.query('SELECT * FROM users WHERE email=$1',[email]);
    if(r.rowCount===0) return res.status(401).json({ error:'invalid' });
    const u = r.rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if(!ok) return res.status(401).json({ error:'invalid' });
    // return simple token (user id); replace with JWT as needed
    res.json({ token: 'user-'+u.id, user: { id: u.id, email: u.email, name: u.name, role: u.role } });
  }finally{ client.release() }
});

export default router;

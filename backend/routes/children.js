import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

// create child profile
router.post('/children', async (req,res)=>{
  const { user_id, name, age } = req.body;
  if(!user_id||!name) return res.status(400).json({ error:'missing' });
  const client = await pool.connect();
  try{
    const r = await client.query('INSERT INTO children (user_id,name,age) VALUES ($1,$2,$3) RETURNING *',[user_id,name,age||null]);
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({ error:'db' }) } finally{ client.release() }
});

// list children
router.get('/children/:userId', async (req,res)=>{
  const userId = req.params.userId;
  const client = await pool.connect();
  try{
    const r = await client.query('SELECT * FROM children WHERE user_id=$1',[userId]);
    res.json(r.rows);
  }catch(e){ console.error(e); res.status(500).json({ error:'db' }) } finally{ client.release() }
});

export default router;

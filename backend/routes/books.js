import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

router.get('/:childId/books', async (req,res)=>{
  const { childId } = req.params;
  const client = await pool.connect();
  try{
    const r = await client.query('SELECT * FROM books WHERE child_id=$1 ORDER BY read_date DESC, created_at DESC',[childId]);
    res.json(r.rows);
  }finally{ client.release() }
});

router.post('/:childId/books', async (req,res)=>{
  const { childId } = req.params;
  const { title, author, pages, read_date, experience } = req.body;
  if(!title) return res.status(400).json({ error:'missing title' });
  const client = await pool.connect();
  try{
    const r = await client.query(
      'INSERT INTO books (child_id,title,author,pages,read_date,experience) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [childId,title,author||null,pages||null,read_date||null,experience||null]
    );
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({ error:'db' }) } finally{ client.release() }
});

router.put('/books/:id', async (req,res)=>{ /* update */ const { id } = req.params; const { title,author,pages,read_date,experience } = req.body; const client = await pool.connect(); try{ const r = await client.query('UPDATE books SET title=$1,author=$2,pages=$3,read_date=$4,experience=$5,updated_at=now() WHERE id=$6 RETURNING *',[title,author,pages,read_date,experience,id]); if(r.rowCount===0) return res.status(404).json({error:'not found'}); res.json(r.rows[0]); }catch(e){console.error(e);res.status(500).json({error:'db'})}finally{client.release()} });

router.delete('/books/:id', async (req,res)=>{ const { id } = req.params; const client = await pool.connect(); try{ const r = await client.query('DELETE FROM books WHERE id=$1 RETURNING *',[id]); if(r.rowCount===0) return res.status(404).json({ error:'not found' }); res.json({ ok:true }); }catch(e){ console.error(e); res.status(500).json({ error:'db' }) } finally{ client.release() } });

export default router;

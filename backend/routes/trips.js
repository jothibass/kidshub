import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

router.get('/:childId/trips', async (req,res)=>{ const { childId } = req.params; const client = await pool.connect(); try{ const r = await client.query('SELECT * FROM trips WHERE child_id=$1 ORDER BY from_date DESC NULLS LAST',[childId]); res.json(r.rows); }finally{ client.release() } });

router.post('/:childId/trips', async (req,res)=>{ const { childId } = req.params; const { title, from_date, to_date, location, notes, experience } = req.body; if(!title) return res.status(400).json({ error:'missing title' }); const client = await pool.connect(); try{ const r = await client.query('INSERT INTO trips (child_id,title,from_date,to_date,location,notes,experience,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[childId,title,from_date||null,to_date||null,location||null,notes||null,experience||null,req.user?.id||null]); res.json(r.rows[0]); }catch(e){console.error(e);res.status(500).json({error:'db'})}finally{client.release()} });

router.put('/trips/:id', async (req,res)=>{ const { id } = req.params; const { title, from_date, to_date, location, notes, experience } = req.body; const client = await pool.connect(); try{ const r = await client.query('UPDATE trips SET title=$1,from_date=$2,to_date=$3,location=$4,notes=$5,experience=$6,updated_at=now() WHERE id=$7 RETURNING *',[title,from_date,to_date,location,notes,experience,id]); res.json(r.rows[0]); }catch(e){console.error(e);res.status(500).json({error:'db'})}finally{client.release()} });

router.delete('/trips/:id', async (req,res)=>{ const { id } = req.params; const client = await pool.connect(); try{ const r = await client.query('DELETE FROM trips WHERE id=$1 RETURNING *',[id]); if(r.rowCount===0) return res.status(404).json({ error:'not found' }); res.json({ ok:true }); }catch(e){console.error(e);res.status(500).json({error:'db'})}finally{client.release()} });

export default router;

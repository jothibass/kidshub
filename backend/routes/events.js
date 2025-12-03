import express from 'express';
import { pool } from '../db.js';
const router = express.Router();
router.post('/:childId/events', async (req,res)=>{ const {childId}=req.params; const {title,event_date,description}=req.body; if(!title)return res.status(400).json({error:'missing title'}); const c=await pool.connect(); try{ const r=await c.query('INSERT INTO events (child_id,title,event_date,description) VALUES ($1,$2,$3,$4) RETURNING *',[childId,title,event_date||null,description||null]); res.json(r.rows[0]);}catch(e){res.status(500).json({error:'db'})} finally{c.release()}}); 
router.get('/:childId/events', async (req,res)=>{ const {childId}=req.params; const c=await pool.connect(); try{ const r=await c.query('SELECT * FROM events WHERE child_id=$1 ORDER BY event_date DESC NULLS LAST',[childId]); res.json(r.rows);}catch(e){res.status(500).json({error:'db'})} finally{c.release()}}); 
export default router;

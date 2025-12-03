import express from 'express';
import { pool } from '../db.js';
const router = express.Router();
router.get('/interests', async (req,res)=>{ const c=await pool.connect(); try{ const r=await c.query('SELECT * FROM interests ORDER BY name'); res.json(r.rows);}catch(e){res.status(500).json({error:'db'})} finally{c.release()}}); 
router.post('/interests', async (req,res)=>{ const { name }=req.body; if(!name) return res.status(400).json({error:'missing name'}); const c=await pool.connect(); try{ const r=await c.query('INSERT INTO interests (name) VALUES ($1) RETURNING *',[name]); res.json(r.rows[0]);}catch(e){res.status(500).json({error:'db'})} finally{c.release()}}); 
router.post('/children/:childId/interests', async (req,res)=>{ const childId=req.params.childId; const { interest_id }=req.body; if(!interest_id) return res.status(400).json({error:'missing interest_id'}); const c=await pool.connect(); try{ await c.query('INSERT INTO child_interests (child_id, interest_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',[childId,interest_id]); res.json({ok:true});}catch(e){res.status(500).json({error:'db'})} finally{c.release()}}); 
export default router;

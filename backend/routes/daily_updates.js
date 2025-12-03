import express from 'express';
import { pool } from '../db.js';
const router = express.Router();
router.post('/:childId/daily_updates', async (req,res)=>{ const {childId}=req.params; const {body,photo_media_id}=req.body; if(!body)return res.status(400).json({error:'missing body'}); const c=await pool.connect(); try{ const r=await c.query('INSERT INTO daily_updates (child_id,body,photo_media_id) VALUES ($1,$2,$3) RETURNING *',[childId,body,photo_media_id||null]); res.json(r.rows[0]);}catch(e){res.status(500).json({error:'db'})} finally{c.release()}}); 
router.get('/:childId/daily_updates', async (req,res)=>{ const {childId}=req.params; const limit=Math.min(50,parseInt(req.query.limit||'20')); const c=await pool.connect(); try{ const r=await c.query('SELECT du.*, m.s3_key as photo_s3_key FROM daily_updates du LEFT JOIN media m ON m.id=du.photo_media_id WHERE du.child_id=$1 ORDER BY du.created_at DESC LIMIT $2',[childId,limit]); res.json(r.rows);}catch(e){res.status(500).json({error:'db'})} finally{c.release()}}); 
export default router;

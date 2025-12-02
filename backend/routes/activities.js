import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

router.get('/:childId/activities', async (req,res)=>{ const { childId } = req.params; const client = await pool.connect(); try{ const r = await client.query('SELECT * FROM activities WHERE child_id=$1 ORDER BY activity_date DESC',[childId]); res.json(r.rows); }finally{ client.release() } });

router.post('/:childId/activities', async (req,res)=>{ const { childId } = req.params; const { title, description, activity_date, tags, experience } = req.body; if(!title) return res.status(400).json({ error:'missing title' }); const client = await pool.connect(); try{ const r = await client.query('INSERT INTO activities (child_id,title,description,activity_date,tags,experience,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',[childId,title,description||null,activity_date||null,tags||null,experience||null,req.user?.id||null]); res.json(r.rows[0]); }catch(e){ console.error(e); res.status(500).json({ error:'db' }) } finally{ client.release() } });

router.put('/activities/:id', async (req,res)=>{ const { id } = req.params; const { title, description, activity_date, tags, experience } = req.body; const client = await pool.connect(); try{ const r = await client.query('UPDATE activities SET title=$1,description=$2,activity_date=$3,tags=$4,experience=$5,updated_at=now() WHERE id=$6 RETURNING *',[title,description,activity_date,tags,experience,id]); res.json(r.rows[0]); }catch(e){console.error(e);res.status(500).json({error:'db'})}finally{client.release()} });

router.delete('/activities/:id', async (req,res)=>{ const { id } = req.params; const client = await pool.connect(); try{ const r = await client.query('DELETE FROM activities WHERE id=$1 RETURNING *',[id]); if(r.rowCount===0) return res.status(404).json({ error:'not found' }); res.json({ ok:true }); }catch(e){ console.error(e); res.status(500).json({ error:'db' }) } finally{ client.release() } });

export default router;

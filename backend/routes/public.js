import express from 'express';
import { pool } from '../db.js';
import { getPresignedGetUrl } from '../lib/s3-utils.js';
const router = express.Router();
router.get('/p/:slug', async (req,res)=>{ const slug=req.params.slug; const c=await pool.connect(); try{ const childR=await c.query('SELECT id,name,age FROM children WHERE slug=$1 AND is_published=true',[slug]); if(childR.rowCount===0) return res.status(404).json({error:'not found'}); const child=childR.rows[0]; const childId=child.id;
const [booksR,tripsR,eventsR,mediaR,updatesR]=await Promise.all([
  c.query('SELECT id,title,author,pages,read_date,experience,created_at FROM books WHERE child_id=$1 AND (COALESCE(published,true)=true) ORDER BY read_date DESC NULLS LAST',[childId]),
  c.query('SELECT id,title,from_date,to_date,location,experience,created_at FROM trips WHERE child_id=$1 ORDER BY from_date DESC NULLS LAST',[childId]),
  c.query('SELECT id,title,event_date,description,created_at FROM events WHERE child_id=$1 ORDER BY event_date DESC NULLS LAST',[childId]),
  c.query('SELECT id,s3_key,caption,taken_at,mime_type FROM media WHERE child_id=$1 AND is_public=true ORDER BY created_at DESC LIMIT 50',[childId]),
  c.query('SELECT id,body,photo_media_id,created_at FROM daily_updates WHERE child_id=$1 ORDER BY created_at DESC LIMIT 50',[childId])
]);
const items=await Promise.all(mediaR.rows.map(async r=>{ let url=null; try{ url=await getPresignedGetUrl({bucket:process.env.S3_BUCKET,key:r.s3_key,expiresIn:300}) }catch(e){} return {...r,url}; }));
const updates=await Promise.all(updatesR.rows.map(async u=>{ if(u.photo_media_id){ try{ const m=await c.query('SELECT s3_key FROM media WHERE id=$1',[u.photo_media_id]); if(m.rowCount){ const url=await getPresignedGetUrl({bucket:process.env.S3_BUCKET,key:m.rows[0].s3_key,expiresIn:300}); return {...u,photo_url:url}; } }catch(e){} } return u; }));
res.json({ child:{name:child.name,age:child.age,slug}, books:booksR.rows, trips:tripsR.rows, events:eventsR.rows, media:items, daily_updates:updates });
}catch(e){res.status(500).json({error:'server'})} finally{c.release()}}); 
export default router;

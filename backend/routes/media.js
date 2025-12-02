import express from 'express';
import { createPresignedPutUrl, headObject, getPresignedGetUrl } from '../lib/s3-utils.js';
import { pool } from '../db.js';
const router = express.Router();

router.post('/:childId/media/presign', async (req,res)=>{
  try{
    const { childId } = req.params;
    const { filename, contentType, size } = req.body;
    if(!filename || !contentType) return res.status(400).json({ error:'filename and contentType required' });
    const maxSize = parseInt(process.env.MAX_UPLOAD_BYTES || '10485760');
    if(size && size > maxSize) return res.status(400).json({ error:'file too large' });
    const { uploadUrl, key } = await createPresignedPutUrl({ bucket: process.env.S3_BUCKET, childId, filename, contentType });
    res.json({ uploadUrl, key, expiresIn: 120 });
  }catch(e){ console.error(e); res.status(500).json({ error:'presign failed' }) }
});

router.post('/:childId/media', async (req,res)=>{
  const { childId } = req.params;
  const { s3_key, mime_type, size_bytes, caption, taken_at, type='photo', is_private=true } = req.body;
  try{
    await headObject({ bucket: process.env.S3_BUCKET, key: s3_key });
    const client = await pool.connect();
    try{
      const q = `INSERT INTO media (child_id, uploaded_by, s3_key, mime_type, size_bytes, caption, taken_at, type, is_private) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
      const vals = [childId, req.user?.id || null, s3_key, mime_type, size_bytes || null, caption || null, taken_at || null, type, is_private];
      const r = await client.query(q, vals);
      res.json(r.rows[0]);
    }finally{ client.release() }
  }catch(e){ console.error(e); res.status(500).json({ error:'metadata failed', detail: e.message }) }
});

router.get('/:childId/media', async (req,res)=>{
  const { childId } = req.params;
  const limit = Math.min(50, parseInt(req.query.limit || '20'));
  const offset = parseInt(req.query.offset || '0');
  const client = await pool.connect();
  try{
    const q = `SELECT id, s3_key, thumbnail_key, caption, taken_at, type, is_private, created_at FROM media WHERE child_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    const r = await client.query(q, [childId, limit, offset]);
    const items = await Promise.all(r.rows.map(async row=>{
      const thumbKey = row.thumbnail_key || row.s3_key;
      const thumbUrl = await getPresignedGetUrl({ bucket: process.env.S3_BUCKET, key: thumbKey, expiresIn: 300 });
      return { ...row, thumbUrl };
    }));
    res.json({ items, limit, offset });
  }catch(e){ console.error(e); res.status(500).json({ error:'list failed' }) } finally{ client.release() }
});

router.get('/media/:id', async (req,res)=>{
  const id = req.params.id;
  const client = await pool.connect();
  try{
    const r = await client.query('SELECT * FROM media WHERE id = $1', [id]);
    if(r.rowCount===0) return res.status(404).json({ error:'not found' });
    const row = r.rows[0];
    const url = await getPresignedGetUrl({ bucket: process.env.S3_BUCKET, key: row.s3_key, expiresIn: 300 });
    res.json({ ...row, url });
  }catch(e){ console.error(e); res.status(500).json({ error:'get failed' }) } finally{ client.release() }
});

router.delete('/media/:id', async (req,res)=>{
  const id = req.params.id;
  const client = await pool.connect();
  try{
    const r = await client.query('DELETE FROM media WHERE id=$1 RETURNING *',[id]);
    if(r.rowCount===0) return res.status(404).json({ error:'not found' });
    res.json({ ok:true, deleted: r.rows[0] });
  }catch(e){ console.error(e); res.status(500).json({ error:'delete failed' }) } finally{ client.release() }
});

export default router;

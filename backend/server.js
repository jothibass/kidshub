import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { pool, testConnection } from './db.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', async (req,res)=>{
  try{
    const t = await testConnection()
    res.json({ ok: true, now: t })
  }catch(e){ res.status(500).json({ok:false, error: e.message}) }
})

app.post('/api/signup', async (req,res)=>{
  const { email, password, role='parent', name } = req.body
  if(!email || !password) return res.status(400).json({ error: 'missing email or password' })
  const hashed = await bcrypt.hash(password, 10)
  const client = await pool.connect()
  try{
    const q = `INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id, email, role, name`
    const r = await client.query(q, [email, hashed, role, name])
    res.json(r.rows[0])
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }finally{ client.release() }
})

app.post('/api/children', async (req,res)=>{
  const { user_id, name, age } = req.body
  if(!user_id || !name) return res.status(400).json({ error:'missing' })
  const client = await pool.connect()
  try{
    const q = `INSERT INTO children (user_id, name, age) VALUES ($1,$2,$3) RETURNING *`
    const r = await client.query(q, [user_id, name, age])
    res.json(r.rows[0])
  }catch(e){ console.error(e); res.status(500).json({error:'db'}) } finally { client.release() }
})

app.post('/api/children/:childId/books', async (req,res)=>{
  const { childId } = req.params
  const { title, author, pages } = req.body
  const client = await pool.connect()
  try{
    const q = `INSERT INTO books (child_id, title, author, pages, read_date) VALUES ($1,$2,$3,$4, CURRENT_DATE) RETURNING *`
    const r = await client.query(q, [childId, title, author, pages])
    res.json(r.rows[0])
  }catch(e){ console.error(e); res.status(500).json({error:'db'}) } finally { client.release() }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=> console.log('Backend listening on', PORT))

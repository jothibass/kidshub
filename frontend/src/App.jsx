import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function App(){
  const [health, setHealth] = useState(null)
  useEffect(()=>{ axios.get('/api/health').then(r=>setHealth(r.data)).catch(()=>setHealth({ok:false})) },[])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <h1>KidsHub — Prototype</h1>
      <p>Basic frontend that talks to <code>/api</code></p>
      <pre>{JSON.stringify(health, null, 2)}</pre>

      <section style={{ marginTop: 20 }}>
        <h2>Quick actions</h2>
        <AddUserForm />
      </section>
    </div>
  )
}

function AddUserForm(){
  const [email,setEmail]=useState('')
  const [pw,setPw]=useState('')
  const [msg,setMsg]=useState('')
  async function signup(){
    try{
      const r = await axios.post('/api/signup', { email, password: pw, role: 'parent', name: 'Parent' })
      setMsg('Created: ' + r.data.email)
    }catch(e){ setMsg('Error') }
  }
  return (
    <div>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <button onClick={signup}>Sign up</button>
      <div>{msg}</div>
    </div>
  )
}

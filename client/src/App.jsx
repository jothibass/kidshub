import React, {useState, useEffect} from 'react'
import axios from 'axios'

const API = (path) => (import.meta.env.PROD ? `/api${path}` : `http://localhost:3000/api${path}`)

export default function App(){
  const [profiles, setProfiles] = useState([])
  const [active, setActive] = useState('jivantika')
  const [profile, setProfile] = useState(null)

  useEffect(()=>{ fetchProfile(active) }, [active])
  useEffect(()=>{ fetchPublicProfiles() }, [])

  async function fetchProfile(id){ try{ const r = await axios.get(API(`/profiles/${id}`)); setProfile(r.data); }catch(e){ setProfile(null) }}
  async function fetchPublicProfiles(){ try{ const r = await axios.get(API('/public-profiles')); setProfiles(r.data); }catch(e){} }

  async function addBook(title, author){
    await axios.post(API(`/profiles/${active}/books`), { title, author }); fetchProfile(active)
  }

  return (
    <div style={{padding:20, fontFamily:'Arial'}}>
      <h1>KidsHub — {active}</h1>
      <div style={{display:'flex', gap:20}}>
        <div style={{width:220}}>
          <h3>Profiles</h3>
          <div>
            <button onClick={()=>setActive('jivantika')}>Jivantika</button>
            <button onClick={()=>setActive('dikshan')}>Dikshan</button>
          </div>
          <h4>Public Profiles</h4>
          <ul>{profiles.map(p=> <li key={p.id}>{p.name}</li>)}</ul>
        </div>
        <div style={{flex:1}}>
          {profile ? (
            <>
              <h2>{profile.name}</h2>
              <label>
                <input type="checkbox" checked={profile.public} onChange={async (e)=>{ await axios.put(API(`/profiles/${profile.id}`), { public: e.target.checked }); fetchProfile(active); fetchPublicProfiles(); }} /> Public
              </label>

              <section>
                <h3>Books</h3>
                <AddBook onAdd={addBook} />
                <ul>{profile.books.map(b => <li key={b.id}>{b.title} — {b.author}</li>)}</ul>
              </section>
            </>
          ) : <div>Loading...</div>}
        </div>
      </div>
    </div>
  )
}

function AddBook({onAdd}){
  const [t, setT] = useState(''); const [a, setA] = useState('')
  return (
    <form onSubmit={e=>{ e.preventDefault(); onAdd(t,a); setT(''); setA('') }}>
      <input placeholder="Title" value={t} onChange={e=>setT(e.target.value)} />
      <input placeholder="Author" value={a} onChange={e=>setA(e.target.value)} />
      <button>Add</button>
    </form>
  )
}

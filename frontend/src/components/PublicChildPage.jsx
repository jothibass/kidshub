import React,{useEffect,useState}from'react';
export default function PublicChildPage({slug}){const[data,setData]=useState(null);const[err,setErr]=useState(null);
useEffect(()=>{fetch(`/p/${encodeURIComponent(slug)}`).then(async r=>{if(!r.ok)throw new Error('not found');setData(await r.json());}).catch(e=>setErr(e.message));},[slug]);
if(err)return<div className="card">Page not found or not published.</div>;
if(!data)return<div className="card">Loading...</div>;
return(<div className="kidhub-shell"><div className="header"><div className="logo">KH</div><div><div className="title">{data.child.name}</div><div className="subtitle">Age: {data.child.age}</div></div></div>
<div className="card"><h3>Books</h3>{data.books.length===0?<div className="small">No books</div>:data.books.map(b=>(<div key={b.id}className="card"style={{marginBottom:8}}><div style={{fontWeight:700}}>{b.title}</div><div className="small">{b.author} • {b.pages} pages</div><div style={{marginTop:6}}>{b.experience}</div></div>))}</div>
<div className="card"><h3>Trips</h3>{data.trips.map(t=><div key={t.id}><strong>{t.title}</strong> — {t.experience}</div>)}</div>
<div className="card"><h3>Daily Updates</h3>{data.daily_updates.map(u=>(<div key={u.id}className="card"style={{marginBottom:8}}><div>{new Date(u.created_at).toLocaleString()}</div><div>{u.body}</div>{u.photo_url&&<img src={u.photo_url}style={{width:'100%',maxWidth:480,marginTop:8}}/>}</div>))}</div>
<div className="card"><h3>Gallery</h3><div className="gallery-grid">{data.media.map(m=>(<div key={m.id}className="photo-card"><img src={m.url}alt={m.caption}/><div className="meta"><div style={{fontWeight:700}}>{m.caption}</div></div></div>))}</div></div>
</div>);}

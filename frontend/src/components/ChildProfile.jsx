import React, { useEffect, useState } from 'react';
import * as api from '../api/kidshub';
import '../styles/kidshub-theme.css';

/**
 * ChildProfile
 * Props:
 *  - childId (required)
 *  - childName (optional)
 */
export default function ChildProfile({ childId, childName="Child" }) {
  const [tab, setTab] = useState('books'); // books | activities | trips | photos | preview
  const [books, setBooks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [trips, setTrips] = useState([]);
  const [media, setMedia] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(()=> { loadAll(); }, [childId]);

  async function loadAll() {
    try {
      const [b,a,t,m] = await Promise.all([
        api.listBooks(childId).catch(()=>[]),
        api.listActivities(childId).catch(()=>[]),
        api.listTrips(childId).catch(()=>[]),
        api.listMedia(childId).then(r=>r.items).catch(()=>[])
      ]);
      setBooks(b); setActivities(a); setTrips(t); setMedia(m || []);
    } catch (err) {
      console.error(err);
    }
  }

  // callbacks after create
  const onBookCreated = (b) => { setBooks(s=>[b,...s]) ; setStatusMsg('Book saved'); }
  const onActivityCreated = (a) => { setActivities(s=>[a,...s]); setStatusMsg('Activity saved'); }
  const onTripCreated = (t) => { setTrips(s=>[t,...s]); setStatusMsg('Trip saved'); }
  const onMediaUploaded = (m) => { setMedia(s=>[m,...s]); setStatusMsg('Photo uploaded'); }

  async function handlePublish() {
    // Client-side assemble a simple "published page" and optionally send to backend.
    setPublishing(true);
    try {
      const published = {
        childId, childName, books, activities, trips, media
      };
      // If you have a backend publish endpoint, call it here:
      // await fetch(`${API_BASE}/api/publish`, { method:'POST', body: JSON.stringify(published) })
      setStatusMsg('Published locally (preview shown). If you want server publish, add API endpoint.');
      setTab('preview');
    } catch (err) {
      console.error(err);
      setStatusMsg('Publish failed: ' + err.message);
    } finally { setPublishing(false); }
  }

  return (
    <div className="kidhub-shell">
      <div className="header">
        <div className="logo">KH</div>
        <div>
          <div className="title">KidsHub — {childName}</div>
          <div className="subtitle">Add books, photos, trips & your experiences</div>
        </div>
      </div>

      <div className="card">
        <div className="tabs">
          <div className={`tab ${tab==='books'?'active':''}`} onClick={()=>setTab('books')}>Books</div>
          <div className={`tab ${tab==='activities'?'active':''}`} onClick={()=>setTab('activities')}>Activities</div>
          <div className={`tab ${tab==='trips'?'active':''}`} onClick={()=>setTab('trips')}>Trips</div>
          <div className={`tab ${tab==='photos'?'active':''}`} onClick={()=>setTab('photos')}>Photos</div>
          <div className={`tab ${tab==='preview'?'active':''}`} onClick={()=>setTab('preview')}>Preview</div>
        </div>

        <div>
          { statusMsg && <div style={{marginBottom:8}} className="small">{statusMsg}</div> }

          { tab==='books' && <div className="grid-2">
            <div>
              <BookForm childId={childId} onCreated={onBookCreated} />
              <div style={{marginTop:12}}>
                {books.length===0 ? <div className="small">No books yet</div> : books.map(b=>(
                  <div key={b.id} style={{marginBottom:8}} className="card">
                    <div style={{fontWeight:700}}>{b.title}</div>
                    <div className="small">{b.author || ''} • {b.pages? b.pages+'pg':''}</div>
                    {b.experience && <div style={{marginTop:6}}>{b.experience}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="card preview">
                <strong>Quick tips</strong>
                <p className="small">Ask your child: "What was your favourite part? Who did you like? Draw a picture and upload a photo."</p>
              </div>
            </div>
          </div> }

          { tab==='activities' && <div className="grid-2">
            <div>
              <ActivityForm childId={childId} onCreated={onActivityCreated} />
              <div style={{marginTop:12}}>
                {activities.length===0 ? <div className="small">No activities yet</div> : activities.map(a=>(
                  <div key={a.id} className="card" style={{marginBottom:8}}>
                    <div style={{fontWeight:700}}>{a.title}</div>
                    <div className="small">{a.activity_date}</div>
                    {a.experience && <div style={{marginTop:6}}>{a.experience}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card preview">
                <strong>Activity ideas</strong>
                <ul className="small">
                  <li>Write 3 words about your day.</li>
                  <li>Draw a picture and upload it.</li>
                  <li>Record where you went and one thing you learned.</li>
                </ul>
              </div>
            </div>
          </div> }

          { tab==='trips' && <div className="grid-2">
            <div>
              <TripForm childId={childId} onCreated={onTripCreated} />
              <div style={{marginTop:12}}>
                {trips.length===0 ? <div className="small">No trips yet</div> : trips.map(t=>(
                  <div key={t.id} className="card" style={{marginBottom:8}}>
                    <div style={{fontWeight:700}}>{t.title} <span className="small">({t.from_date || ''})</span></div>
                    {t.location && <div className="small">{t.location}</div>}
                    {t.experience && <div style={{marginTop:6}}>{t.experience}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card preview">
                <strong>Trip prompts</strong>
                <div className="small">
                  Ask: "What was the funniest moment?" "What did you try to eat?" "Who did you go with?"
                </div>
              </div>
            </div>
          </div> }

          { tab==='photos' && <div className="grid-2">
            <div>
              <div className="card">
                <UploadPhoto childId={childId} onUploaded={onMediaUploaded} />
              </div>
              <div style={{marginTop:12}}>
                <Gallery items={media} />
              </div>
            </div>
            <div>
              <div className="card preview">
                <strong>Photo tips</strong>
                <div className="small">Choose bright photos. Add captions to explain why it was special.</div>
              </div>
            </div>
          </div> }

          { tab==='preview' && <div>
            <div className="card preview">
              <h3>Preview — {childName}</h3>
              <div>
                <h4>Books</h4>
                {books.length===0 ? <div className="small">No books to show</div> :
                  books.map(b=> <div key={b.id}><strong>{b.title}</strong> — {b.experience || <em>No experience</em>}</div>)}
              </div>
              <div style={{marginTop:10}}>
                <h4>Activities</h4>
                {activities.map(a=> <div key={a.id}><strong>{a.title}</strong> — {a.experience || <em>No experience</em>}</div>)}
              </div>
              <div style={{marginTop:10}}>
                <h4>Trips</h4>
                {trips.map(t=> <div key={t.id}><strong>{t.title}</strong> — {t.experience || <em>No experience</em>}</div>)}
              </div>
              <div style={{marginTop:10}}>
                <h4>Photos</h4>
                <Gallery items={media} />
              </div>
            </div>

            <div className="footer-row">
              <div className="small">Preview stored locally — click Publish to save or call your publish API.</div>
              <div>
                <button className="btn secondary" onClick={()=>setTab('books')}>Edit</button>
                <button className="btn" onClick={handlePublish} disabled={publishing} style={{marginLeft:8}}>
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div> }
        </div>
      </div>
    </div>
  );
}

/* ========== Child sub-components (kept here for simplicity) ========== */

function BookForm({ childId, onCreated }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [readDate, setReadDate] = useState('');
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) { alert('Please add title'); return; }
    setSaving(true);
    try {
      const b = await api.createBook(childId, { title, author, pages: pages?parseInt(pages):null, read_date: readDate||null, experience });
      onCreated && onCreated(b);
      setTitle(''); setAuthor(''); setPages(''); setReadDate(''); setExperience('');
    } catch (err) { alert('Save failed: ' + err.message) } finally { setSaving(false) }
  }

  return (
    <div className="card">
      <h3>Add a Book</h3>
      <div className="form-row"><input type="text" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} /></div>
      <div className="form-row"><input type="text" placeholder="Author" value={author} onChange={e=>setAuthor(e.target.value)} /></div>
      <div className="form-row"><input type="text" placeholder="Pages" value={pages} onChange={e=>setPages(e.target.value)} /></div>
      <div className="form-row"><input type="date" value={readDate} onChange={e=>setReadDate(e.target.value)} /></div>
      <div className="form-row"><textarea placeholder="Describe what you liked about the book" value={experience} onChange={e=>setExperience(e.target.value)} /></div>
      <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
        <button className="btn secondary" onClick={()=>{ setTitle(''); setAuthor(''); setPages(''); setReadDate(''); setExperience('')}}>Clear</button>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Book'}</button>
      </div>
    </div>
  );
}

function ActivityForm({ childId, onCreated }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) { alert('Please add a title'); return; }
    setSaving(true);
    try {
      const a = await api.createActivity(childId, { title, description: desc, activity_date: date||null, experience });
      onCreated && onCreated(a);
      setTitle(''); setDesc(''); setDate(''); setExperience('');
    } catch (err) { alert('Save failed: ' + err.message) } finally { setSaving(false) }
  }

  return (
    <div className="card">
      <h3>Add Activity</h3>
      <div className="form-row"><input type="text" placeholder="Activity title" value={title} onChange={e=>setTitle(e.target.value)} /></div>
      <div className="form-row"><textarea placeholder="Short description" value={desc} onChange={e=>setDesc(e.target.value)} /></div>
      <div className="form-row"><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
      <div className="form-row"><textarea placeholder="How did it feel? (experience)" value={experience} onChange={e=>setExperience(e.target.value)} /></div>
      <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
        <button className="btn secondary" onClick={()=>{ setTitle(''); setDesc(''); setDate(''); setExperience(''); }}>Clear</button>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Activity'}</button>
      </div>
    </div>
  );
}

function TripForm({ childId, onCreated }) {
  const [title, setTitle] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [experience, setExperience] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) { alert('Please add title'); return; }
    setSaving(true);
    try {
      const t = await api.createTrip(childId, { title, from_date: fromDate||null, to_date: toDate||null, location, notes, experience });
      onCreated && onCreated(t);
      setTitle(''); setFromDate(''); setToDate(''); setLocation(''); setNotes(''); setExperience('');
    } catch (err) { alert('Save failed: ' + err.message) } finally { setSaving(false) }
  }

  return (
    <div className="card">
      <h3>Add Trip</h3>
      <div className="form-row"><input placeholder="Trip title" value={title} onChange={e=>setTitle(e.target.value)} /></div>
      <div className="form-row"><input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} /><input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} /></div>
      <div className="form-row"><input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} /></div>
      <div className="form-row"><textarea placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
      <div className="form-row"><textarea placeholder="Child describes the trip (experience)" value={experience} onChange={e=>setExperience(e.target.value)} /></div>
      <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
        <button className="btn secondary" onClick={()=>{ setTitle(''); setFromDate(''); setToDate(''); setLocation(''); setNotes(''); setExperience(''); }}>Clear</button>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Trip'}</button>
      </div>
    </div>
  );
}

/* UploadPhoto component — presign PUT flow */
function UploadPhoto({ childId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) { alert('Please choose a photo'); return; }
    setLoading(true);
    try {
      const pres = await api.presign(childId, file.name, file.type, file.size);
      await fetch(pres.uploadUrl, { method:'PUT', headers: {'Content-Type': file.type}, body: file });
      const meta = await api.postMediaMeta(childId, { s3_key: pres.key, mime_type: file.type, size_bytes: file.size, caption });
      setFile(null); setCaption('');
      onUploaded && onUploaded(meta);
    } catch (err) {
      alert('Upload error: ' + err.message);
      console.error(err);
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div style={{marginBottom:8}} className="small">Upload a photo (max 10MB)</div>
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
      <div className="form-row"><input placeholder="Caption" value={caption} onChange={e=>setCaption(e.target.value)} /></div>
      <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
        <button className="btn secondary" onClick={()=>{ setFile(null); setCaption('') }}>Clear</button>
        <button className="btn" onClick={upload} disabled={loading}>{loading ? 'Uploading...' : 'Upload Photo'}</button>
      </div>
    </div>
  );
}

/* Simple Gallery */
function Gallery({ items=[] }) {
  if (!items || items.length===0) return <div className="small">No photos yet</div>;
  return (
    <div className="gallery-grid">
      {items.map(it=>(
        <div className="photo-card" key={it.id}>
          <img src={it.thumbUrl || it.url || '/placeholder.png'} alt={it.caption || ''} />
          <div className="meta">
            <div style={{fontWeight:700}}>{it.caption || 'Photo'}</div>
            <div className="small">{new Date(it.taken_at || it.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

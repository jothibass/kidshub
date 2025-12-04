const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Simple file storage on disk (for demo). In production use S3.
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage });

// Simple JSON file DB
const DATA_FILE = path.join(__dirname, 'data.json');
let DB = {};
if (fs.existsSync(DATA_FILE)) {
  try { DB = JSON.parse(fs.readFileSync(DATA_FILE)); } catch(e) { DB = {}; }
}
function saveDB() { fs.writeFileSync(DATA_FILE, JSON.stringify(DB, null, 2)); }

// Init sample profiles
if (!DB.profiles) {
  DB.profiles = {
    jivantika: { id: 'jivantika', name: 'Jivantika', public: false, books: [], trips: [], activities: [] },
    dikshan:   { id: 'dikshan',   name: 'Dikshan',   public: false, books: [], trips: [], activities: [] }
  };
  saveDB();
}

// API: health
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API: get profile
app.get('/api/profiles/:id', (req, res) => {
  const id = req.params.id;
  const p = DB.profiles[id];
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// API: list public profiles
app.get('/api/public-profiles', (req, res) => {
  const list = Object.values(DB.profiles).filter(p => p.public).map(p => ({ id: p.id, name: p.name }));
  res.json(list);
});

// API: update profile (simple, no auth in demo)
app.put('/api/profiles/:id', (req, res) => {
  const id = req.params.id; const p = DB.profiles[id];
  if (!p) return res.status(404).json({ error: 'Not found' });
  const allowed = ['name','public'];
  for (const k of allowed) if (req.body[k] !== undefined) p[k] = req.body[k];
  DB.profiles[id] = p; saveDB(); res.json(p);
});

// Add book
app.post('/api/profiles/:id/books', (req, res) => {
  const id = req.params.id; const p = DB.profiles[id]; if (!p) return res.status(404).json({ error: 'Not found' });
  const book = { id: uuidv4(), title: req.body.title || 'Untitled', author: req.body.author || '', readOn: req.body.readOn || null };
  p.books.unshift(book); DB.profiles[id] = p; saveDB(); res.json(book);
});

// Upload photos for trip
app.post('/api/profiles/:id/trips', upload.array('photos', 12), (req, res) => {
  const id = req.params.id; const p = DB.profiles[id]; if (!p) return res.status(404).json({ error: 'Not found' });
  const files = req.files || [];
  const photos = files.map(f => ({ id: path.basename(f.filename), url: `/uploads/${f.filename}` }));
  const trip = { id: uuidv4(), title: req.body.title || 'Trip', date: req.body.date || null, photos, notes: req.body.notes || '' };
  p.trips.unshift(trip); DB.profiles[id] = p; saveDB(); res.json(trip);
});

// Serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

// Serve client build when in production
const CLIENT_BUILD_DIR = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_BUILD_DIR)) {
  app.use(express.static(CLIENT_BUILD_DIR));
  app.get('*', (req, res) => res.sendFile(path.join(CLIENT_BUILD_DIR, 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

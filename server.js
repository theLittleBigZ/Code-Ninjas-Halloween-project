// Basic Express server template for Code Ninjas Halloween Photobooth
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const fs = require('fs');
const DB_PATH = path.join(__dirname, 'db.csv');
const crypto = require('crypto');

// Simple registration endpoint that appends a JSON line to db.text
app.post('/register', (req, res) => {
  try {
    const body = req.body || {};
    console.log(body);
    // Minimal server-side validation
    if (!body.firstname || !body.lastname || !body.email) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Create a record with a lightweight id and a UUID (for QR linking)
    const record = Object.assign({}, body, {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      uuid: (crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.randomBytes(1)[0]&15>>c/4).toString(16))),
      createdAt: new Date().toISOString()
    });

    // Helper to CSV-escape a value
    function csvEscape(v) {
      if (v === undefined || v === null) return '';
      const s = String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    }

    const headers = ['firstname','lastname','email','numofphotos','consent'];
    const rowValues = [
      record.firstname,
      record.lastname,
      record.email,
      record.numofphotos,
      record.consent
    ];

    const row = rowValues.map(csvEscape).join(',') + '\n';

    // If file doesn't exist, write header first, otherwise append row
    fs.access(DB_PATH, fs.constants.F_OK, (err) => {
      const data = err ? headers.join(',') + '\n' + row : row;
      fs.appendFile(DB_PATH, data, (err) => {
        if (err) {
          console.error('Failed to write to DB CSV', err);
          return res.status(500).json({ ok: false, error: 'Failed to save' });
        }

        // Build a QR link that points to the /user/:uuid endpoint on this server
        const qrData = `${req.protocol}://${req.get('host')}/user/${encodeURIComponent(record.uuid)}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=650x650&data=${encodeURIComponent(qrData)}`;

        return res.status(201).json({ ok: true, id: record.id, uuid: record.uuid, qrUrl });
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// TODO: Add endpoint to generate/send QR code
// app.post('/generate-qr', (req, res) => { ... });

// TODO: Add endpoint for photobooth to fetch user info by QR/UUID
// app.get('/user/:uuid', (req, res) => { ... });

// TODO: Add endpoint to upload photo and email to user
// app.post('/upload-photo', (req, res) => { ... });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Simple lookup endpoint to return registration by UUID (reads CSV)
app.get('/user/:uuid', (req, res) => {
  const uuid = req.params.uuid;
  fs.readFile(DB_PATH, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ ok: false, error: 'Not found' });
    const lines = data.split('\n').filter(Boolean);
    if (lines.length < 2) return res.status(404).json({ ok: false, error: 'No records' });
    const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const obj = {};
      header.forEach((h, idx) => { obj[h] = cols[idx] || ''; });
      if (obj.uuid === uuid) return res.json({ ok: true, record: obj });
    }
    return res.status(404).json({ ok: false, error: 'Record not found' });
  });
});

function parseCsvLine(line) {
  const res = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { cur += '"'; i++; continue; }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) { res.push(cur); cur = ''; continue; }
    cur += ch;
  }
  res.push(cur);
  return res;
}
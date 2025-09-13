// Basic Express server template for Code Ninjas Halloween Photobooth
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3301;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const fs = require('fs');
const crypto = require('crypto');
const knex = require('./db');

// Simple registration endpoint that appends a JSON line to db.text
app.post('/register', async (req, res) => {
  try {
    const body = req.body || {};

    // Minimal server-side validation
    if (!body.parentFirst || !body.parentLast || !body.email) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Create a record with a lightweight id and a UUID (for QR linking)
    const record = Object.assign({}, body, {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      uuid: (crypto.randomUUID ? crypto.randomUUID() : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.randomBytes(1)[0]&15>>c/4).toString(16))),
      createdAt: new Date().toISOString()
    });

    // Insert into DB
    await knex('registrations').insert({
      id: record.id,
      uuid: record.uuid,
      createdAt: record.createdAt,
      parentFirst: record.parentFirst,
      parentLast: record.parentLast,
      email: record.email,
      phone: record.phone || '',
      postal: record.postal || '',
      numPhotos: Number(record.numPhotos) || 1,
      children: record.children || '',
      ages: record.ages || '',
      consent: record.consent || ''
    });

    const qrData = `${req.protocol}://${req.get('host')}/user/${encodeURIComponent(record.uuid)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=650x650&data=${encodeURIComponent(qrData)}`;

    return res.status(201).json({ ok: true, id: record.id, uuid: record.uuid, qrUrl });
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
app.get('/user/:uuid', async (req, res) => {
  const uuid = req.params.uuid;
  try {
    const rec = await knex('registrations').where({ uuid }).first();
    if (!rec) return res.status(404).json({ ok: false, error: 'Record not found' });
    return res.json({ ok: true, record: rec });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Admin: list registrations (no auth - consider adding in production)
app.get('/admin/registrations', async (req, res) => {
  try {
    const rows = await knex('registrations').orderBy('createdAt', 'desc').limit(1000);
    return res.json({ ok: true, rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
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

// Basic Express server template for Code Ninjas Halloween Photobooth
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// TODO: Add registration endpoint
// app.post('/register', (req, res) => { ... });

// TODO: Add endpoint to generate/send QR code
// app.post('/generate-qr', (req, res) => { ... });

// TODO: Add endpoint for photobooth to fetch user info by QR/UUID
// app.get('/user/:uuid', (req, res) => { ... });

// TODO: Add endpoint to upload photo and email to user
// app.post('/upload-photo', (req, res) => { ... });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

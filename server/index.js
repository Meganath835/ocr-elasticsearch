require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');

const uploadRoute = require('./routes/upload');
const searchRoute = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'OCR API is running. Open http://localhost:5173 for the app.' });
});

app.use('/api/upload', uploadRoute);
app.use('/api', searchRoute);

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'File too large.' });
  if (err.message === 'Unsupported file type') return res.status(400).json({ message: err.message });
  res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

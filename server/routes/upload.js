const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const upload = require('../middleware/upload');
const { extractText } = require('../services/ocrService');
const { indexDocument } = require('../services/elasticService');

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  let step = 'ocr';
  try {
    const { text, confidence } = await extractText(req.file.path);

    step = 'build-doc';
    const doc = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      originalPath: req.file.path,
      mimeType: req.file.mimetype,
      uploadedAt: new Date().toISOString(),
      ocrText: text,
      confidence,
      pageCount: 1,
      tags: [],
    };

    step = 'index';
    await indexDocument(doc);
    res.status(201).json(doc);
  } catch (err) {
    console.error(`[UPLOAD ERROR at step: ${step}]`, err.message);
    console.error(err.stack);
    res.status(422).json({ message: err.message, step, stack: err.stack });
  }
});

module.exports = router;

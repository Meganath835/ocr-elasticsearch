const express = require('express');
const router = express.Router();
const { searchDocuments, getDocumentById, deleteDocumentById } = require('../services/elasticService');

router.get('/search', async (req, res) => {
  const { q, from = 0, size = 10 } = req.query;
  if (!q) return res.status(400).json({ message: 'Query parameter q is required.' });

  try {
    const result = await searchDocuments(q, parseInt(from), parseInt(size));
    res.json({
      total: result.hits.total.value,
      hits: result.hits.hits,
    });
  } catch (err) {
    console.error(err);
    res.status(503).json({ message: 'Search failed.', error: err.message });
  }
});

router.get('/documents/:id', async (req, res) => {
  try {
    const doc = await getDocumentById(req.params.id);
    res.json(doc);
  } catch (err) {
    if (err.meta?.statusCode === 404) return res.status(404).json({ message: 'Document not found.' });
    res.status(500).json({ message: 'Failed to fetch document.' });
  }
});

router.delete('/documents/:id', async (req, res) => {
  try {
    await deleteDocumentById(req.params.id);
    res.json({ success: true });
  } catch (err) {
    if (err.meta?.statusCode === 404) return res.status(404).json({ message: 'Document not found.' });
    res.status(500).json({ message: 'Failed to delete document.' });
  }
});

module.exports = router;

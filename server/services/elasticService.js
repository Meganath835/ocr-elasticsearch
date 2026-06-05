const MiniSearch = require('minisearch');
const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '../../search-index.json');

const FIELDS = ['ocrText', 'filename'];
const STORE_FIELDS = ['id', 'filename', 'originalName', 'mimeType', 'uploadedAt', 'ocrText', 'confidence', 'pageCount', 'tags'];

let miniSearch = new MiniSearch({ fields: FIELDS, storeFields: STORE_FIELDS });
let documents = {};

function loadIndex() {
  if (!fs.existsSync(INDEX_FILE)) return;
  try {
    const saved = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    documents = saved.documents || {};
    if (saved.index) {
      miniSearch = MiniSearch.loadJSON(saved.index, { fields: FIELDS, storeFields: STORE_FIELDS });
    }
  } catch {
    documents = {};
    miniSearch = new MiniSearch({ fields: FIELDS, storeFields: STORE_FIELDS });
  }
}

function saveIndex() {
  fs.writeFileSync(INDEX_FILE, JSON.stringify({ index: JSON.stringify(miniSearch), documents }));
}

loadIndex();

async function indexDocument(doc) {
  if (miniSearch.has(doc.id)) miniSearch.replace(doc);
  else miniSearch.add(doc);
  documents[doc.id] = doc;
  saveIndex();
}

async function searchDocuments(query, from = 0, size = 10) {
  const results = miniSearch.search(query, { prefix: true, fuzzy: 0.2 });
  const total = results.length;

  const hits = results.slice(from, from + size).map(r => {
    const doc = documents[r.id];
    const words = query.toLowerCase().split(/\s+/);
    let snippet = doc.ocrText.slice(0, 300);
    words.forEach(w => {
      snippet = snippet.replace(new RegExp(w, 'gi'), m => `<em>${m}</em>`);
    });
    return {
      _id: r.id,
      _score: r.score,
      _source: doc,
      highlight: { ocrText: [snippet] },
    };
  });

  return { hits: { total: { value: total }, hits } };
}

async function getDocumentById(id) {
  const doc = documents[id];
  if (!doc) throw Object.assign(new Error('Document not found'), { meta: { statusCode: 404 } });
  return doc;
}

async function deleteDocumentById(id) {
  if (!documents[id]) throw Object.assign(new Error('Document not found'), { meta: { statusCode: 404 } });
  miniSearch.remove(documents[id]);
  delete documents[id];
  saveIndex();
}

module.exports = { indexDocument, searchDocuments, getDocumentById, deleteDocumentById };

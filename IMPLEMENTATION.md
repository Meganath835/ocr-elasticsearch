# OCR + Elasticsearch Website — Implementation Plan

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React + Vite                      |
| Backend      | Node.js + Express                 |
| OCR Engine   | Tesseract.js (or Python pytesseract via microservice) |
| Search       | Elasticsearch 8.x                 |
| File Storage | Local disk or AWS S3              |
| Database     | Elasticsearch (primary store)     |

---

## Project Structure

```
ocr-elasticsearch/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadForm.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── DocumentViewer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Search.jsx
│   │   │   └── Document.jsx
│   │   └── api/             # Axios calls to backend
├── server/                  # Express backend
│   ├── routes/
│   │   ├── upload.js        # POST /api/upload
│   │   └── search.js        # GET  /api/search
│   ├── services/
│   │   ├── ocrService.js    # Tesseract.js wrapper
│   │   └── elasticService.js# Elasticsearch client
│   ├── middleware/
│   │   └── upload.js        # Multer file handling
│   └── index.js
├── docker-compose.yml       # Elasticsearch + Kibana
└── .env
```

---

## Elasticsearch Index Schema

```json
PUT /ocr-documents
{
  "mappings": {
    "properties": {
      "id":           { "type": "keyword" },
      "filename":     { "type": "keyword" },
      "originalPath": { "type": "keyword" },
      "uploadedAt":   { "type": "date" },
      "mimeType":     { "type": "keyword" },
      "pageCount":    { "type": "integer" },
      "ocrText":      { "type": "text", "analyzer": "standard" },
      "confidence":   { "type": "float" },
      "tags":         { "type": "keyword" }
    }
  }
}
```

---

## API Endpoints

### Upload & OCR
```
POST /api/upload
  Body: multipart/form-data { file: <image|pdf> }
  Response: { id, filename, ocrText, confidence, uploadedAt }
```

### Search
```
GET /api/search?q=<query>&from=0&size=10
  Response: { total, hits: [{ id, filename, highlight, score }] }
```

### Get Document
```
GET /api/documents/:id
  Response: { id, filename, ocrText, uploadedAt, confidence }
```

### Delete Document
```
DELETE /api/documents/:id
  Response: { success: true }
```

---

## Core Service Logic

### ocrService.js
```js
const Tesseract = require('tesseract.js');

async function extractText(filePath) {
  const { data } = await Tesseract.recognize(filePath, 'eng', {
    logger: m => console.log(m)
  });
  return { text: data.text, confidence: data.confidence };
}

module.exports = { extractText };
```

### elasticService.js
```js
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: process.env.ES_NODE });

async function indexDocument(doc) {
  return client.index({ index: 'ocr-documents', id: doc.id, document: doc });
}

async function searchDocuments(query, from = 0, size = 10) {
  return client.search({
    index: 'ocr-documents',
    from, size,
    query: { match: { ocrText: query } },
    highlight: { fields: { ocrText: {} } }
  });
}

module.exports = { indexDocument, searchDocuments };
```

---

## Frontend Pages

### Home (Upload)
- Drag-and-drop file upload zone (images: PNG, JPG, TIFF; documents: PDF)
- Progress bar during OCR processing
- Preview of extracted text after processing
- Success redirect to search page

### Search
- Full-text search input
- Results list with filename, date, relevance score, and highlighted snippet
- Pagination (10 results per page)
- Click result to open Document view

### Document View
- Original file preview (image or PDF embed)
- Full extracted OCR text alongside
- Copy-to-clipboard button
- Delete button

---

## Environment Variables (.env)

```
ES_NODE=http://localhost:9200
ES_INDEX=ocr-documents
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20
PORT=3001
```

---

## Docker Setup (docker-compose.yml)

```yaml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:8.13.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data

  kibana:
    image: kibana:8.13.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  esdata:
```

---

## Dependencies

### Backend
```
express multer uuid
tesseract.js
@elastic/elasticsearch
dotenv cors
```

### Frontend
```
react react-dom
axios
react-dropzone
react-router-dom
```

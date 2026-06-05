# OCR + Elasticsearch Website — Workflow

## Getting Started (Step-by-Step)

Follow these steps in order before writing any application code.

---

### Step 1 — Install Prerequisites

Make sure the following are installed on your machine:

| Tool          | Version  | Download                              |
|---------------|----------|---------------------------------------|
| Node.js       | 20 LTS   | https://nodejs.org                    |
| npm           | 10+      | Bundled with Node.js                  |
| Docker Desktop| Latest   | https://www.docker.com/products/docker-desktop |
| Git           | Any      | https://git-scm.com                   |

Verify installs:
```bash
node -v
npm -v
docker -v
git -v
```

---

### Step 2 — Create the Project Folder Structure

```bash
mkdir ocr-elasticsearch
cd ocr-elasticsearch
mkdir server client uploads
mkdir server/routes server/services server/middleware
mkdir client/src
```

---

### Step 3 — Initialise Git

```bash
git init
echo "node_modules/" >> .gitignore
echo "uploads/" >> .gitignore
echo ".env" >> .gitignore
```

---

### Step 4 — Create the .env File

Create a file named `.env` in the project root:

```
ES_NODE=http://localhost:9200
ES_INDEX=ocr-documents
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20
PORT=3001
```

---

### Step 5 — Start Elasticsearch with Docker

Create `docker-compose.yml` in the project root (see IMPLEMENTATION.md for the full file), then run:

```bash
docker-compose up -d
```

Wait ~30 seconds, then confirm Elasticsearch is running:

```bash
curl http://localhost:9200
# Expected: JSON response with cluster_name and version
```

Kibana (optional visual dashboard) will be available at `http://localhost:5601`.

---

### Step 6 — Create the Elasticsearch Index

Run this curl command to create the index with the correct field mappings:

```bash
curl -X PUT http://localhost:9200/ocr-documents \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

Expected response: `{"acknowledged":true}`

---

### Step 7 — Set Up the Backend (Express)

```bash
cd server
npm init -y
npm install express multer uuid tesseract.js @elastic/elasticsearch dotenv cors
npm install --save-dev nodemon
```

Add to `server/package.json` scripts:
```json
"scripts": {
}
```

Create `server/index.js` — the Express app entry point that:
- Loads `.env` with `require('dotenv').config({ path: '../.env' })`
- Registers the upload and search routes
- Serves on `PORT` from `.env`

---

### Step 8 — Set Up the Frontend (React + Vite)

```bash
cd ../client
npm create vite@latest . -- --template react
npm install
npm install axios react-dropzone react-router-dom
```

---

### Step 9 — Build the Backend Services

In order, create these files (refer to IMPLEMENTATION.md for code):

1. `server/middleware/upload.js` — Multer config (file filter + size limit)
2. `server/services/ocrService.js` — Tesseract.js wrapper
3. `server/services/elasticService.js` — Elasticsearch client (index + search)
4. `server/routes/upload.js` — POST `/api/upload` route
5. `server/routes/search.js` — GET `/api/search` route

---

### Step 10 — Build the Frontend Pages

In order, create these files:

1. `client/src/api/` — Axios functions that call `/api/upload` and `/api/search`
2. `client/src/components/UploadForm.jsx` — Drag-and-drop file input
3. `client/src/components/SearchBar.jsx` — Query input
4. `client/src/components/ResultCard.jsx` — Single search result display
5. `client/src/pages/Home.jsx` — Upload page
6. `client/src/pages/Search.jsx` — Search results page
7. `client/src/pages/Document.jsx` — Full document view
8. `client/src/App.jsx` — React Router setup connecting the pages

---

### Step 11 — Run Both Servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Running on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

### Step 12 — Test the Full Flow

1. Open `http://localhost:5173` in a browser
2. Upload a PNG or JPG image containing text
3. Watch the OCR progress, then see the extracted text
4. Navigate to the Search page
5. Type a word that appears in the image
6. Confirm the document appears in results with a highlighted snippet

If the upload succeeds but search returns nothing, check the Elasticsearch index:
```bash
curl http://localhost:9200/ocr-documents/_count
```

---

## End-to-End Data Flow

```
User uploads file
       │
       ▼
[Frontend: UploadForm]
  - Accepts PNG / JPG / TIFF / PDF
  - Sends multipart POST to /api/upload
       │
       ▼
[Backend: Multer middleware]
  - Validates file type and size
  - Saves file to /uploads with a UUID filename
       │
       ▼
[Backend: ocrService.js]
  - Tesseract.js reads the saved file
  - Returns { text, confidence }
       │
       ▼
[Backend: elasticService.js]
  - Builds document object:
      { id, filename, ocrText, confidence, uploadedAt, ... }
  - Indexes document into ES index "ocr-documents"
       │
       ▼
[Backend: Response to frontend]
  - Returns { id, filename, ocrText, confidence }
       │
       ▼
[Frontend: Result preview]
  - Displays extracted text
  - User navigates to Search page
```

---

## Search Flow

```
User types query in SearchBar
       │
       ▼
[Frontend: GET /api/search?q=<query>]
       │
       ▼
[Backend: Elasticsearch match query on ocrText]
  - Returns hits with highlighted snippets
       │
       ▼
[Frontend: ResultCard list]
  - Shows filename, score, date, highlighted snippet
  - Click opens Document view
```

---

## Development Setup Steps

### 1. Start Elasticsearch
```bash
docker-compose up -d
# Verify: http://localhost:9200
# Kibana:  http://localhost:5601
```

### 2. Create ES Index
```bash
curl -X PUT http://localhost:9200/ocr-documents \
  -H "Content-Type: application/json" \
  -d @es-index-mapping.json
```

### 3. Install & Start Backend
```bash
cd server
npm install
npm run dev        # nodemon on port 3001
```

### 4. Install & Start Frontend
```bash
cd client
npm install
npm run dev        # Vite on port 5173
```

---

## Build & Deploy Steps

### 1. Build Frontend
```bash
cd client && npm run build
# Output: client/dist/
```

### 2. Serve Static Files from Express
```js
app.use(express.static(path.join(__dirname, '../client/dist')));
```

### 3. Production Environment
- Set `NODE_ENV=production` and a real `ES_NODE` URL
- Use a process manager: `pm2 start server/index.js`
- Optionally put Nginx in front as reverse proxy

---

## Feature Milestones

| Phase | Features                                         |
|-------|--------------------------------------------------|
| 1     | File upload + Tesseract OCR + ES indexing        |
| 2     | Full-text search with highlighted snippets       |
| 3     | Document list view + delete                      |
| 4     | PDF multi-page support (pdf2pic conversion)      |
| 5     | Tag / category filter on search                  |
| 6     | User authentication (JWT)                        |
| 7     | Bulk upload + background job queue (Bull/Redis)  |

---

## Error Handling Strategy

| Scenario                  | Handling                                      |
|---------------------------|-----------------------------------------------|
| Unsupported file type      | Reject in Multer middleware, return 400       |
| File too large             | Multer limit, return 413                      |
| OCR fails                  | Log error, return 422 with message            |
| Elasticsearch unreachable  | Return 503, surface error in UI               |
| Document not found         | Return 404 from ES get-by-id                  |

---

## Key Decisions

- **Tesseract.js over Python pytesseract**: runs in the same Node.js process, no separate microservice needed.
- **Elasticsearch as primary store**: no separate relational database; ES stores both the text and the metadata.
- **Single-node ES in dev**: `discovery.type=single-node` keeps local setup simple; swap for a cluster in production.
- **Multer for uploads**: handles multipart form data and enforces file size limits without extra dependencies.

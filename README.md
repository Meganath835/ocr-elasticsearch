# OCR Document Search

A full-stack web application that extracts text from images and PDFs using OCR (Optical Character Recognition) and makes them instantly searchable through a full-text search engine.

---

## Features

- **Drag & drop upload** — supports PNG, JPG, TIFF, and PDF files (up to 20 MB)
- **OCR extraction** — powered by Tesseract.js, extracts text with confidence scoring
- **Full-text search** — fuzzy and prefix matching via MiniSearch (no external services required)
- **Document viewer** — side-by-side view of the original file and extracted text
- **Copy & delete** — copy extracted text to clipboard or remove documents
- **Persistent index** — search index is saved to disk and survives server restarts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express 5 |
| OCR | Tesseract.js v7 |
| Search | MiniSearch v7 |
| File handling | Multer v2 |

> No Docker or external database required. Everything runs locally.

---

## Project Structure

```
ocr-elasticsearch/
├── client/                        # React frontend
│   └── src/
│       ├── api/index.js           # Axios API calls
│       ├── components/
│       │   ├── UploadForm.jsx     # Drag-and-drop uploader
│       │   ├── SearchBar.jsx      # Search input
│       │   ├── ResultCard.jsx     # Search result item
│       │   └── DocumentViewer.jsx # File + text side-by-side view
│       └── pages/
│           ├── Home.jsx           # Upload page
│           ├── Search.jsx         # Search results page
│           └── Document.jsx       # Single document view
├── server/                        # Express backend
│   ├── middleware/upload.js       # Multer config
│   ├── routes/
│   │   ├── upload.js              # POST /api/upload
│   │   └── search.js              # GET /api/search, GET/DELETE /api/documents/:id
│   ├── services/
│   │   ├── ocrService.js          # Tesseract.js wrapper
│   │   └── elasticService.js      # MiniSearch index (search, index, delete)
│   └── index.js                   # Express entry point
├── uploads/                       # Saved uploaded files (gitignored)
├── search-index.json              # MiniSearch persistent index (gitignored)
└── .env                           # Environment config (gitignored)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v20 LTS or higher
- npm v10+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ocr-elasticsearch.git
cd ocr-elasticsearch
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
PORT=3001
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20
```

### 3. Install and run the backend

```bash
cd server
npm install
npm run dev
# Server running on http://localhost:3001
```

### 4. Install and run the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
# App running on http://localhost:5173
```

### 5. Open the app

Go to **http://localhost:5173** in your browser.

---

## API Reference

### Upload a file

```
POST /api/upload
Content-Type: multipart/form-data

Body: { file: <image|pdf> }
```

Response:
```json
{
  "id": "uuid",
  "filename": "uuid.png",
  "ocrText": "extracted text...",
  "confidence": 94.5,
  "uploadedAt": "2026-06-05T10:00:00.000Z"
}
```

### Search documents

```
GET /api/search?q=<query>&from=0&size=10
```

Response:
```json
{
  "total": 3,
  "hits": [
    {
      "_id": "uuid",
      "_score": 8.4,
      "_source": { "filename": "...", "ocrText": "...", ... },
      "highlight": { "ocrText": ["...matched <em>text</em>..."] }
    }
  ]
}
```

### Get a document

```
GET /api/documents/:id
```

### Delete a document

```
DELETE /api/documents/:id
```

---

## How It Works

```
User uploads file
      │
      ▼
Multer saves file to /uploads with a UUID filename
      │
      ▼
Tesseract.js reads file as Buffer and extracts text + confidence score
      │
      ▼
MiniSearch indexes the document (persisted to search-index.json)
      │
      ▼
Frontend displays extracted text preview
      │
      ▼
User searches → MiniSearch returns ranked hits with highlighted snippets
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend server port |
| `UPLOAD_DIR` | `./uploads` | Directory where uploaded files are saved |
| `MAX_FILE_SIZE_MB` | `20` | Maximum upload size in megabytes |

---

## Known Limitations

- OCR accuracy depends on image quality — clear, high-contrast images work best
- PDF support extracts text from the first page only (multi-page support is a planned improvement)
- Search index is stored in memory during runtime — large collections (10,000+ documents) may need a dedicated search engine

---

## License

MIT

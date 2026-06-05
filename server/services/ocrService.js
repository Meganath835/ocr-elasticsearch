const Tesseract = require('tesseract.js');
const fs = require('fs');

async function extractText(filePath) {
  // Read as Buffer to avoid Leptonica failing on paths that contain spaces
  const imageBuffer = fs.readFileSync(filePath);
  const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
    logger: () => {},
  });
  return { text: data.text, confidence: data.confidence };
}

module.exports = { extractText };

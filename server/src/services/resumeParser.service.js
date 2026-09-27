import path from 'path';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Normalizes extracted text:
 * - standardizes line breaks
 * - collapses multiple inline spaces/tabs to a single space
 * - collapses excessive blank lines
 * - trims trailing/leading whitespace
 */
export function normalizeExtractedText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts plain text from an in-memory buffer (PDF or DOCX).
 *
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} originalName - Original filename with extension
 * @param {string} [mimetype] - Upload MIME type
 * @returns {Promise<string>} Normalized extracted text
 */
export async function extractResumeText(buffer, originalName, mimetype = '') {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('File buffer is empty or invalid.');
  }

  const ext = path.extname(originalName || '').toLowerCase();
  let rawText = '';

  try {
    if (ext === '.pdf' || mimetype === 'application/pdf') {
      let parser;
      try {
        parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        rawText = result?.text || '';
      } finally {
        if (parser && typeof parser.destroy === 'function') {
          try {
            await parser.destroy();
          } catch {
            // Ignore parser cleanup errors
          }
        }
      }
    } else if (
      ext === '.docx' ||
      mimetype.includes('wordprocessingml') ||
      mimetype.includes('msword') ||
      mimetype === 'application/octet-stream'
    ) {
      const mammothExtractor = mammoth.extractRawText || mammoth.default?.extractRawText;
      if (!mammothExtractor) {
        throw new Error('DOCX extractor module not available.');
      }
      const result = await mammothExtractor({ buffer });
      rawText = result?.value || '';
    } else {
      throw new Error(`Unsupported document extension: ${ext || 'unknown'}`);
    }
  } catch (parseError) {
    console.error(`[Resume Parser Error] Failed to extract text from ${originalName}:`, parseError.message);
    throw new Error(`Failed to parse resume document: ${parseError.message}`);
  }

  const normalized = normalizeExtractedText(rawText);

  if (!normalized || normalized.length < 5) {
    throw new Error('Extracted resume text is empty or unreadable. Please ensure the document contains selectable text and is not an empty or scanned image file.');
  }

  return normalized;
}

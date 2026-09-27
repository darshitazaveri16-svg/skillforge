import multer from 'multer';
import path from 'path';

// Max file size: 5 MB in bytes
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file extensions and MIME types
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/octet-stream', // Some clients send docx as octet-stream
];

// Configure in-memory storage (do not persist raw files to disk)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Validate extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(
      new Error('Invalid file type. Only PDF and DOCX files are supported.'),
      false
    );
  }

  // Validate MIME type if present
  if (mime && !ALLOWED_MIME_TYPES.includes(mime)) {
    return cb(
      new Error('Invalid file MIME type. Only PDF and DOCX documents are accepted.'),
      false
    );
  }

  cb(null, true);
};

// Multer upload instance
export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

/**
 * Express wrapper middleware to intercept Multer errors cleanly
 * and return standard JSON error responses without crashing or leaking stacks.
 */
export const handleResumeUpload = (req, res, next) => {
  const uploader = upload.single('resume');

  uploader(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File size exceeds the 5 MB limit. Please upload a smaller file.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }

      // Custom file validation error from fileFilter
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed. Only PDF and DOCX files are allowed.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF or DOCX resume document.',
      });
    }

    next();
  });
};

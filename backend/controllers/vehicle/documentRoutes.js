// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadDocument,
  getVehicleDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
} = require('../controllers/documentController');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' directory exists
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize upload middleware
const upload = multer({ storage: storage });

router.post('/upload/:vehicleId', upload.single('documentFile'), uploadDocument);
router.get('/:vehicleId', getVehicleDocuments);
router.get('/single/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.get('/download/:id', downloadDocument);

module.exports = router;
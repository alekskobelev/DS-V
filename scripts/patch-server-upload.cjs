const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('import multer from')) {
  code = code.replace(
    'import path from "path";',
    'import path from "path";\nimport multer from "multer";\nimport fs from "fs";'
  );

  const uploadCode = `
  // --- UPLOAD ENDPOINT ---
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext)
    }
  });

  const upload = multer({ storage: storage });

  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }
      // Return the public URL
      const fileUrl = '/uploads/' + req.file.filename;
      res.json({ success: true, url: fileUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload file' });
    }
  });
  // -------------------------
`;

  code = code.replace(
    '// --- VITE MIDDLEWARE SETUP ---',
    uploadCode + '\n// --- VITE MIDDLEWARE SETUP ---'
  );

  fs.writeFileSync('server.ts', code);
  console.log('Added /api/upload endpoint');
} else {
  console.log('Upload endpoint already exists');
}

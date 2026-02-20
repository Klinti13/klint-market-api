import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// Përdorim rrugën ABSOLUTE që Render të mos ngatërrohet
const __dirname = path.resolve();
const uploadDir = path.join(__dirname, 'uploads');

// Kontrollojmë dhe krijojmë folderin me rrugë absolute
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Folderi 'uploads' u krijua me sukses në:", uploadDir);
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir); 
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('❌ Gabim: Lejohen vetëm imazhe (JPG, PNG, WEBP)!');
    }
}

const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Asnjë foto nuk u ngarkua" });
    }
    res.send(`/uploads/${req.file.filename}`);
});

export default router;
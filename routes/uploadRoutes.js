import path from 'path';
import express from 'express';
import multer from 'multer';
import fs from 'fs'; // SHTUAR: Libraria që menaxhon skedarët e serverit

const router = express.Router();

// MAGJIA KËTU: Krijon folderin 'uploads' automatikisht në Render nëse nuk ekziston!
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
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
        cb('Vetëm imazhe (JPG, PNG, WEBP)!');
    }
}

const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', upload.single('image'), (req, res) => {
    res.send(`/uploads/${req.file.filename}`);
});

export default router;
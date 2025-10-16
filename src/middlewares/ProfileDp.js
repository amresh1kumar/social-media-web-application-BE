const multer = require("multer");
const path = require("path");

// storage config
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "uploads/"); // folder name
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
   },
});

// filter only images
const fileFilter = (req, file, cb) => {
   const allowedTypes = /jpeg|jpg|png/;
   const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
   const mime = allowedTypes.test(file.mimetype);
   if (ext && mime) cb(null, true);
   else cb(new Error("Only .jpg, .jpeg, .png allowed"));
};

const upload = multer({ storage, fileFilter });
module.exports = upload;

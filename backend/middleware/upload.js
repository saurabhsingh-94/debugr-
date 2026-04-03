import multer from "multer";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// Accept common image and document formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|log/;
  const isAllowed = allowedTypes.test(file.mimetype) || allowedTypes.test(file.originalname.toLowerCase());

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, PDFs, and text logs are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

export default upload;

import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import AppError from "../utils/AppError.js";

const upload = multer({
  limits: { fileSize: 100 * 1024 * 1024 }, // 50 MB limit for each file
  storage: multer.diskStorage({
    destination: (req, file, cd) => {
      cd(null, "uploads/"); // Save files in 'uploads/' directory
    },
    filename: (req, file, cd) => {
      const uniqueName = `${uuidv4()}-${file.originalname}`;
      cd(null, uniqueName); // Unique name to avoid conflicts
    },
  }),
  fileFilter: (req, file, cd) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [".jpg", ".svg", ".jpeg", ".png", ".webp", ".mp4"];
    if (!allowedExts.includes(ext)) {
      return cd(new AppError("Unsupported file type...", 400), false);
    }
    cd(null, true);
  },
});

export default upload;

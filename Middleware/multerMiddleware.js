import path from "path";
import multer from "multer";
import AppError from "../utils/AppError.js";
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cd) => {
      cd(null, file.originalname);
    },
  }),
  fileFilter: (req, file, cd) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&
      ext !== ".svg" &&
      ext !== ".jpeg" &&
      ext !== ".png" &&
      ext !== ".webp" &&
      ext !== ".mp4"
    ) {
      cd(new AppError("unSupported file type...", 400));
    }
    cd(null, true);
  },
});
export default upload;

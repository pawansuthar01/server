import { config } from "dotenv";
config();

import app from "./app.js";
import { v2 } from "cloudinary";

const PORT = process.env.PORT || 5005;

v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// export const razorpay = new Razorpay({
//   key_id: process.env.KEY_ID,
//   key_secret: process.env.SECRET_ID,
// });

//socket listen//
//sever listen//
app.listen(PORT, () => {
  console.log(`server is listen http://localhost:${PORT}`);
});

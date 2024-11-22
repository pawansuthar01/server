import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
mongoose.set("strictQuery", false);
const dataBaseConnection = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);
    if (connection) {
      console.log(`successfully connect DB ${connection.host}`);
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
export default dataBaseConnection;

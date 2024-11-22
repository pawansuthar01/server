import Router from "express";
import { isLoggedIn } from "../Middleware/authMiddleware.js";
import {
  getAllProduct,
  getProduct,
  LikeAndDisLikeProduct,
} from "../Controllers/Product.Controller.js";
const ProductRouter = Router();
ProductRouter.get("/", getAllProduct);
ProductRouter.route("/:id")
  .get(isLoggedIn, getProduct)
  .put(isLoggedIn, LikeAndDisLikeProduct);
export default ProductRouter;

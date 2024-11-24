import { Router } from "express";
import { authorizeRoles, isLoggedIn } from "../Middleware/authMiddleware.js";
import { getAllDate } from "../Controllers/Auth.Controller.js";
import upload from "../Middleware/multerMiddleware.js";

import {
  deletePostById,
  deleteReelById,
  getAllPost,
  getAllReel,
  postUpdate,
  PostUpload,
  reelUpdate,
  ReelUpload,
} from "../Controllers/Content.Controller.js";
import {
  productDelete,
  productUpdate,
  ProductUpload,
} from "../Controllers/Product.Controller.js";
const ADMINRouter = Router();
ADMINRouter.get(
  "/User",
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),
  getAllDate
);
ADMINRouter.route("/Post")
  .get(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), getAllPost)
  .post(
    isLoggedIn,
    authorizeRoles("ADMIN", "AUTHOR"),
    upload.single("post"),
    PostUpload
  );

ADMINRouter.route("/Reel")
  .get(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), getAllReel)
  .post(
    isLoggedIn,
    authorizeRoles("ADMIN", "AUTHOR"),
    upload.single("reel"),
    ReelUpload
  );

ADMINRouter.route("/Post/:id")
  .delete(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), deletePostById)

  .put(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), postUpdate);

ADMINRouter.route("/Reel/:id")
  .delete(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), deleteReelById)

  .put(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), reelUpdate);

////product api///
ADMINRouter.route("/Product").post(
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),

  upload.array("images", 10),
  ProductUpload
);

ADMINRouter.route("/Product/:id")
  .put(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), productUpdate)
  .delete(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), productDelete);
export default ADMINRouter;

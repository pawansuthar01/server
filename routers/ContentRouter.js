import { Router } from "express";
import {
  addCommentPost,
  addCommentReel,
  deleteCommentInPostById,
  deleteCommentInReelById,
  LikeAndDisLikePost,
  exitCommentInPostById,
  exitCommentInReelById,
  getPost,
  getReel,
  LikeAndDisLikeReel,
  getAllPost,
  AddReplayToComment,
  removeReplayToComment,
} from "../Controllers/Content.Controller.js";

import { isLoggedIn } from "../Middleware/authMiddleware.js";

const ContentRouter = Router();

ContentRouter.route("/Post/:id")
  .post(isLoggedIn, addCommentPost)
  .get(isLoggedIn, getPost)
  .put(isLoggedIn, LikeAndDisLikePost);

ContentRouter.route("/posts/:postId/comments/:commentId/AddNewComment").put(
  isLoggedIn,
  AddReplayToComment
);

ContentRouter.route("/posts/:postId/comments/:commentId/UpdateComment").put(
  isLoggedIn,
  exitCommentInPostById
);

ContentRouter.route(
  "/posts/:postId/comments/:commentId/replays/:replyId"
).delete(isLoggedIn, removeReplayToComment);

ContentRouter.route("/Reel/:id")
  .post(isLoggedIn, addCommentReel)
  .get(isLoggedIn, getReel)
  .put(isLoggedIn, LikeAndDisLikeReel);

ContentRouter.route("/Post")
  .get(isLoggedIn, getAllPost)
  .put(isLoggedIn, AddReplayToComment)
  .delete(isLoggedIn, deleteCommentInPostById);

ContentRouter.route("/Reel")
  .put(isLoggedIn, exitCommentInReelById)
  .delete(isLoggedIn, deleteCommentInReelById);

export default ContentRouter;

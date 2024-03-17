import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJwt);

router.route("/:videoId").get(fetchComments).post(addComment);
router.route("/:commentId").delete(deleteComment).patch(updateComment);

export default router;

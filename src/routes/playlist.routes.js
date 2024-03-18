import { Router } from "express";
import {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  updatePlaylist,
} from "../controllers/playlist.controller";

const router = Router();

router.use(verifyJwt);

router.route("/").post(createPlaylist);
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;

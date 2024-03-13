import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller";
import { verifyJwt } from "../middlewares/auth.middleware";

const router = Router();
router.use(verifyJwt);      //all routes

router
  .route("/")
  .get(getAllVideos)
  .patch(
    uploadFields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route("/video-updation/:video-id")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:video-id").patch(togglePublishStatus);

export default router;

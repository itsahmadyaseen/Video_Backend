import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { getSubscribedChannels, getUserChannelSubscriber, toggleSubscription } from "../controllers/subscription.controller";

const router = Router()
router.use(verifyJwt)

router
    .route('/c/:channelId')
    .get(getSubscribedChannels)
    .post(toggleSubscription)

router.route('/u/:subscriberId').get(getUserChannelSubscriber)
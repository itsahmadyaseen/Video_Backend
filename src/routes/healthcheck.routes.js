import { Router } from "express";
import { healthcheck } from "../controllers/healthCheck.controller";

const router = Router()

router.route('/').get(healthcheck)
import { Router } from "express";
import { retrieveJson, storeJson } from "../controllers/jsonData.controller";

const router = Router();

router.post("/", storeJson);
router.get("/", retrieveJson);

export const jsonDataRouter = router;

import express from "express";
import { getLogos, getLogo, createLogo, updateLogo, deleteLogo } from "../controllers/hospitalLogoController.js";
import { auth, adminAuth } from "../middleware/auth.js";
import { validateCreateLogo, validateUpdateLogo } from "../validators/hospitalLogoValidator.js";

const router = express.Router();

router.use(auth);

router.get("/", getLogos);
router.get("/:id", getLogo);
router.post("/", adminAuth, validateCreateLogo, createLogo);
router.put("/:id", adminAuth, validateUpdateLogo, updateLogo);
router.delete("/:id", adminAuth, deleteLogo);

export default router;



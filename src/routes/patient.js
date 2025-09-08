import express from "express";
import { listPatients, admitPatient, getPatient, updatePatient, dischargePatient, deletePatient } from "../controllers/patientController.js";
import { auth } from "../middleware/auth.js";
import { validateAdmitPatient, validateUpdatePatient } from "../validators/patientValidator.js";

const router = express.Router();

// All patient routes require authentication (staff can admit)
router.use(auth);

router.get("/", listPatients);
router.get("/:id", getPatient);
router.post("/admit", validateAdmitPatient, admitPatient);
router.put("/:id", validateUpdatePatient, updatePatient);
router.post("/:id/discharge", dischargePatient);
router.delete("/:id", deletePatient);

export default router;



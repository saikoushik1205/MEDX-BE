import Patient from "../models/Patient.js";
import CareUnit from "../models/CareUnit.js";
import Bed from "../models/Bed.js";

const ensureCareUnitAndBed = async (careUnitId, bedId) => {
  const careUnit = await CareUnit.findOne({ _id: careUnitId, isActive: true });
  if (!careUnit) return { error: "Care unit not found" };
  const bed = await Bed.findOne({ _id: bedId, careUnit: careUnitId, isActive: true });
  if (!bed) return { error: "Bed not found in this care unit" };
  return { careUnit, bed };
};

// List patients (active)
const listPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ isActive: true })
      .populate("careUnit", "careUnit")
      .populate("bed", "name")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admit patient (create)
const admitPatient = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, phone, email, careUnit, bed } = req.body;

    const { error, bed: bedDoc } = await ensureCareUnitAndBed(careUnit, bed);
    if (error) return res.status(404).json({ message: error });

    if (bedDoc.isOccupied) {
      return res.status(400).json({ message: "Selected bed is already occupied" });
    }

    const patient = new Patient({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      careUnit,
      bed,
      createdBy: req.user._id,
    });
    const saved = await patient.save();
    await Bed.findByIdAndUpdate(bed, { isOccupied: true, updatedBy: req.user._id });
    await saved.populate("careUnit", "careUnit");
    await saved.populate("bed", "name");
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get patient
const getPatient = async (req, res) => {
  try {
    const doc = await Patient.findById(req.params.id)
      .populate("careUnit", "careUnit")
      .populate("bed", "name")
      .populate("createdBy", "username")
      .populate("updatedBy", "username");
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    res.json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update patient (optionally move to another bed)
const updatePatient = async (req, res) => {
  try {
    const { careUnit, bed, dischargedAt, ...rest } = req.body;

    // if moving beds/careUnit, validate and free/occupy accordingly
    if (careUnit || bed) {
      const current = await Patient.findById(req.params.id);
      if (!current) return res.status(404).json({ message: "Patient not found" });
      const targetCareUnit = careUnit || current.careUnit;
      const targetBed = bed || current.bed;
      const { error, bed: targetBedDoc } = await ensureCareUnitAndBed(targetCareUnit, targetBed);
      if (error) return res.status(404).json({ message: error });
      if (String(targetBedDoc._id) !== String(current.bed)) {
        if (targetBedDoc.isOccupied) return res.status(400).json({ message: "Target bed is already occupied" });
        // free old bed, occupy new bed
        await Bed.findByIdAndUpdate(current.bed, { isOccupied: false, updatedBy: req.user._id });
        await Bed.findByIdAndUpdate(targetBed, { isOccupied: true, updatedBy: req.user._id });
      }
    }

    const updateData = { ...rest, careUnit, bed, dischargedAt, updatedBy: req.user._id };
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("careUnit", "careUnit")
      .populate("bed", "name")
      .populate("createdBy", "username")
      .populate("updatedBy", "username");
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Discharge patient (free bed)
const dischargePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    if (patient.dischargedAt) return res.status(400).json({ message: "Patient already discharged" });

    patient.dischargedAt = new Date();
    patient.updatedBy = req.user._id;
    await patient.save();
    await Bed.findByIdAndUpdate(patient.bed, { isOccupied: false, updatedBy: req.user._id });
    res.json({ message: "Patient discharged successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Soft delete patient
const deletePatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user._id },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export { listPatients, admitPatient, getPatient, updatePatient, dischargePatient, deletePatient };



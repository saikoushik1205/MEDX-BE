import HospitalLogo from "../models/HospitalLogo.js";

// Get current active logo (or all)
const getLogos = async (req, res) => {
  try {
    const logos = await HospitalLogo.find({ isActive: true })
      .populate("createdBy", "username")
      .populate("updatedBy", "username")
      .sort({ createdAt: -1 });
    res.json(logos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLogo = async (req, res) => {
  try {
    const logo = await HospitalLogo.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("updatedBy", "username");
    if (!logo) return res.status(404).json({ message: "Logo not found" });
    res.json(logo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createLogo = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const doc = new HospitalLogo({
      name,
      imageUrl,
      createdBy: req.user._id,
    });
    const saved = await doc.save();
    await saved.populate("createdBy", "username");
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateLogo = async (req, res) => {
  try {
    const { name, imageUrl, isActive } = req.body;
    const updateData = { name, imageUrl, isActive, updatedBy: req.user._id };
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const updated = await HospitalLogo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "username")
      .populate("updatedBy", "username");
    if (!updated) return res.status(404).json({ message: "Logo not found" });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteLogo = async (req, res) => {
  try {
    const deleted = await HospitalLogo.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user._id },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: "Logo not found" });
    res.json({ message: "Logo deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getLogos, getLogo, createLogo, updateLogo, deleteLogo };



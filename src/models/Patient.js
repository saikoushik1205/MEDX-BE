import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, required: true, maxlength: 100 },
    lastName: { type: String, trim: true, required: true, maxlength: 100 },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone: { type: String, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true },
    careUnit: { type: mongoose.Schema.Types.ObjectId, ref: "CareUnit", required: true, index: true },
    bed: { type: mongoose.Schema.Types.ObjectId, ref: "Bed", required: true, index: true },
    admittedAt: { type: Date, default: Date.now },
    dischargedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// simple guard to ensure discharge occurs after admit
patientSchema.pre("save", function (next) {
  if (this.dischargedAt && this.dischargedAt < this.admittedAt) {
    return next(new Error("dischargedAt cannot be before admittedAt"));
  }
  next();
});

export default mongoose.model("Patient", patientSchema);



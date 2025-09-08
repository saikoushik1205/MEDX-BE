import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    careUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareUnit",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bedSchema.index({ careUnit: 1, isActive: 1 });
bedSchema.index({ name: 1, careUnit: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.model("Bed", bedSchema);



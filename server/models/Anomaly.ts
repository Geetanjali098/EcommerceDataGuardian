import mongoose from "mongoose";
const anomalySchema = new mongoose.Schema({
  type: String,
  severity: String,
  description: String,
  value: mongoose.Schema.Types.Mixed
});

export const Anomaly = mongoose.model("Anomaly", anomalySchema);

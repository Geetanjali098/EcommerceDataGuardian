import mongoose from "mongoose";

const qualityMetricSchema = new mongoose.Schema({
  type: String,
  score: Number,
  lastUpdated: String,
  description: String
});

export const QualityMetric = mongoose.model("QualityMetric", qualityMetricSchema);

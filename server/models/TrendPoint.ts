import mongoose from "mongoose";

const trendPointSchema = new mongoose.Schema({
  label: String,
  value: Number
});

export const TrendPoint = mongoose.model("TrendPoint", trendPointSchema);

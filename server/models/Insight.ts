import mongoose from "mongoose";
const insightSchema = new mongoose.Schema({
  title: String,
  message: String,
  timeAgo: String,
  type: String
});

export const Insight = mongoose.model("Insight", insightSchema);

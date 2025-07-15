import mongoose from "mongoose";
const reportSchema = new mongoose.Schema({
  reportName: String,
  generatedAt: String,
  status: String,
  url: String
});

export const Report = mongoose.model("Report", reportSchema);

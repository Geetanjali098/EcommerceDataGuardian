import mongoose from "mongoose";
const dataIssueSchema = new mongoose.Schema({
  type: String,
  severity: String,
  description: String,
  affected_records: Number
});

export const DataIssue = mongoose.model("DataIssue", dataIssueSchema);

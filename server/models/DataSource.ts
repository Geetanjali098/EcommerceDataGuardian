import mongoose from "mongoose";

const dataSourceSchema = new mongoose.Schema({
  name: String,
  qualityScore: Number,
  records: Number
});

export const DataSource = mongoose.model("DataSource", dataSourceSchema);

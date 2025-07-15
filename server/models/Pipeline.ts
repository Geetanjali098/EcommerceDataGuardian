import mongoose from "mongoose";
const pipelineSchema = new mongoose.Schema({
  name: String,
  status: String,
  lastRun: String,
  records: Number,
  health: Number
});

export const Pipeline = mongoose.model("Pipeline", pipelineSchema);

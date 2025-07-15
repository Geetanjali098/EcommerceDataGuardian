import mongoose, { Schema, Document } from 'mongoose';

export interface IQualityScore extends Document {
  overallScore: number;
  lastUpdated: string;
  passedChecks: number;
  failedChecks: number;
}

const QualityScoreSchema: Schema = new Schema({
  overallScore: { type: Number, required: true },
  lastUpdated: { type: String, required: true },
  passedChecks: { type: Number, required: true },
  failedChecks: { type: Number, required: true },
});

const QualityScore = mongoose.model<IQualityScore>('QualityScore', QualityScoreSchema, 'qualityScores');

export default QualityScore;

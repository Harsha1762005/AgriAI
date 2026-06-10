import { Schema, model, Document } from 'mongoose';

export interface ICrop {
  name: string;
  scientificName: string;
  description: string;
  suitableSeason: string;
  waterRequirement: 'Low' | 'Medium' | 'High';
  expectedYield: string;
  marketDemand: 'Low' | 'Medium' | 'High';
  profitability: number; // 0 to 100 percentage or rating
  growingTips: string[];
  imageUrl: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ICropDocument extends ICrop, Document {}

const CropSchema = new Schema<ICropDocument>(
  {
    name: { type: String, required: true, unique: true },
    scientificName: { type: String, required: true },
    description: { type: String, required: true },
    suitableSeason: { type: String, required: true },
    waterRequirement: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    expectedYield: { type: String, required: true },
    marketDemand: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    profitability: { type: Number, required: true, min: 0, max: 100 },
    growingTips: { type: [String], default: [] },
    imageUrl: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export const CropModel = model<ICropDocument>('Crop', CropSchema);

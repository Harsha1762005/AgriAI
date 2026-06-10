import { Schema, model, Document, Types } from 'mongoose';

export interface IPrediction {
  userId: string;
  type: 'crop' | 'fertilizer' | 'yield';
  
  // Crop recommendation fields
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  temperature?: number;
  humidity?: number;
  ph?: number;
  rainfall?: number;
  crop?: string;
  confidence?: number;
  
  // Fertilizer fields
  fertilizerRecommendations?: Array<{
    nutrient: string;
    status: 'low' | 'high' | 'optimal';
    value: number;
    recommendedFertilizer: string;
    applicationRate: string;
  }>;
  
  // Yield fields
  yieldCropType?: string;
  yieldArea?: number;
  yieldSoilQuality?: string;
  yieldEstimatedOutput?: number;
  yieldRevenue?: number;
  yieldProfit?: number;
  
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IPredictionDocument extends IPrediction, Document {}

const PredictionSchema = new Schema<IPredictionDocument>(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: ['crop', 'fertilizer', 'yield'], required: true },
    
    // Soil & Env parameters
    nitrogen: { type: Number },
    phosphorus: { type: Number },
    potassium: { type: Number },
    temperature: { type: Number },
    humidity: { type: Number },
    ph: { type: Number },
    rainfall: { type: Number },
    
    // Outputs
    crop: { type: String },
    confidence: { type: Number },
    
    // Fertilizer outputs
    fertilizerRecommendations: [
      {
        nutrient: { type: String },
        status: { type: String },
        value: { type: Number },
        recommendedFertilizer: { type: String },
        applicationRate: { type: String }
      }
    ],
    
    // Yield fields
    yieldCropType: { type: String },
    yieldArea: { type: Number },
    yieldSoilQuality: { type: String },
    yieldEstimatedOutput: { type: Number },
    yieldRevenue: { type: Number },
    yieldProfit: { type: Number }
  },
  {
    timestamps: true
  }
);

export const PredictionModel = model<IPredictionDocument>('Prediction', PredictionSchema);

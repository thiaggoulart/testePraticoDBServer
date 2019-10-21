import { Restaurant } from "../entities/restaurant";
import { Model, model, Schema, Document } from "mongoose";

interface restaurantDocument extends Restaurant, Document {} 

export const restaurantModel: Model<restaurantDocument> = model<restaurantDocument>('Restaurant', new Schema({
    
    name: {type: String, required: true}
    
}))
import { User } from "../entities/user";
import { Document, Model, model, Schema } from "mongoose";

interface userDocument extends User, Document {} 

export const usertModel: Model<userDocument> = model<userDocument>('User', new Schema({
    
    name: {type: String, required: true}
     
}))
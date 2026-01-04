import mongoose, { Schema, model, models } from "mongoose";

export interface ICounter {
  _id: string;
  sequence_value: number;
}

const counterSchema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 1 }
});

const Counter = models?.Counter || model<ICounter>("Counter", counterSchema);

export default Counter;
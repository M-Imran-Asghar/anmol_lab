import mongoose, { model, models, Schema } from "mongoose";

export interface ISubTest {
  name: string;
  referenceRange?: string;
  unit?: string;
}

export interface ILabTest {
  name: string;
  code: string;
  price: number;
  sample: string;
  subTests: ISubTest[];
  createdAt: Date;
  updatedAt: Date;
  _id?: mongoose.Types.ObjectId;
}

const subTestSchema = new Schema<ISubTest>(
  {
    name: { type: String, required: true, trim: true },
    referenceRange: { type: String, default: "", trim: true },
    unit: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const labTestSchema = new Schema<ILabTest>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, unique: true, uppercase: true },
    price: { type: Number, required: true, min: 0 },
    sample: { type: String, required: true, trim: true },
    subTests: { type: [subTestSchema], default: [] },
  },
  { timestamps: true }
);

const existingLabTestModel = models?.LabTest as mongoose.Model<ILabTest> | undefined;

// In dev, Next can keep an older compiled schema in the Mongoose model cache.
// If that happens, newly added fields like `subTests.unit` are silently dropped on save.
if (existingLabTestModel && !existingLabTestModel.schema.path("subTests.unit")) {
  delete models.LabTest;
}

const LabTest =
  (models?.LabTest as mongoose.Model<ILabTest> | undefined) ||
  model<ILabTest>("LabTest", labTestSchema);

export default LabTest;

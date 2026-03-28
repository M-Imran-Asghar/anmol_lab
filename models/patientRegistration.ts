import mongoose, { Schema, model, models} from "mongoose";

export interface IPatientRegistration{
    receptionsName: string,
    patientname: string,
    fatherOrHusbandName: string,
    pateintAge: number,
    years_month_day: string,
    cnic: number,
    bloodGroup: string,
    gender: string,
    patientEmail: string,
    patientMobile: number,
    doctorName: string,
    payAmount: number,
    sampleReceived: boolean,
    patientAddress: string,
    createdAt: Date,
    updatedAt: Date,
    _id?: mongoose.Types.ObjectId
    sampleRequiered: boolean
    testName: string | string[]
    patientId: number;
    status: string;
    // New fields for test results - support multiple tests
    testResults?: Array<{
        parentTestName?: string;
        testName: string;
        unit?: string;
        result: string;
        referenceRange?: string;
        notes?: string;
        date?: Date;
    }>;
    // Keep old fields for backward compatibility
    testResult?: string;
    referenceRange?: string;
    resultNotes?: string;
    resultDate?: Date;
    reportPDF?: string | null;
    reportFileName?: string | null;
}

const patientRegistrationSchema = new Schema({
    patientId: { type: Number, unique: true },
    receptionsName: { type: String },
    patientname: { type: String, required: true },
    fatherOrHusbandName: { type: String },
    pateintAge: { type: Number },
    years_month_day: { type: String },    
    cnic: { type: Number },
    bloodGroup: { type: String },
    gender: { type: String },
    patientEmail: { type: String },
    patientMobile: { type: Number },
    doctorName: { type: String },
    payAmount: { type: Number },
    sampleReceived: { type: Boolean },
    sampleRequiered: { type: Boolean },
    testName: { type: Schema.Types.Mixed, required: true }, // Can be string or array
    patientAddress: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, default: "Pending", enum: ["Pending", "Verified"] },
    // New fields for multiple test results
    testResults: [{
        parentTestName: { type: String },
        testName: { type: String, required: true },
        unit: { type: String, default: "" },
        result: { type: String, required: true },
        referenceRange: { type: String, default: "" },
        notes: { type: String, default: "" },
        date: { type: Date, default: Date.now }
    }],
    // Keep old fields for backward compatibility
    testResult: { type: String },
    referenceRange: { type: String },
    resultNotes: { type: String, default: "" },
    resultDate: { type: Date },
    reportPDF: {
      type: String,
      default: null
    },
    reportFileName: {
      type: String,
      default: null
    },
},
 { timestamps: true });

const existingPatientRegistrationModel =
  models?.PatientRegistration as mongoose.Model<IPatientRegistration> | undefined;

// In dev, Next can reuse an older compiled model schema.
// Rebuild it when newer nested result fields are missing.
if (
  existingPatientRegistrationModel &&
  (
    !existingPatientRegistrationModel.schema.path("testResults.unit") ||
    !existingPatientRegistrationModel.schema.path("testResults.parentTestName")
  )
) {
  delete models.PatientRegistration;
}

const PatientRegistration =
  (models?.PatientRegistration as mongoose.Model<IPatientRegistration> | undefined) ||
  model<IPatientRegistration>("PatientRegistration", patientRegistrationSchema);

export default PatientRegistration;

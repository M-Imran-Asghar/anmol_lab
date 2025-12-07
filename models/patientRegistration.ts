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
}


const patientRegistrationSchema = new Schema({
    receptionsName:{ type: String, required: true },
    patientname:{ type: String, required: true },
    fatherOrHusbandName: { type: String, required: true },
    pateintAge:{ type: Number},
    years_month_day:{ type: String},    
    cnic: { type: Number},
    bloodGroup:{ type: String},
    gender: { type: String},
    patientEmail: { type: String},
    patientMobile: { type: Number},
    doctorName: { type: String},
    payAmount: { type: Number},
    sampleReceived: { type: Boolean},
    patientAddress: { type: String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

})

const PatientRegistration = models?.PatientRegistration || 
model<IPatientRegistration>("PatientRegistration", patientRegistrationSchema);

export default PatientRegistration;
import { NextRequest, NextResponse } from "next/server";
import PatientRegistration from "@/models/patientRegistration";
import { connectionToDB } from "@/lib/db";
import jwt from "jsonwebtoken";


export async function POST(request: NextRequest) {

    const JWT_SECRET = process.env.JWT_SECRET!;

    try {

        await connectionToDB()

        const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Token missing" },
        { status: 401 }
      );
    }

    // 2️⃣ Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }
        
        const { 
            receptionsName,
            patientname,
            fatherOrHusbandName,
            pateintAge,
            years_month_day,
            cnic,
            bloodGroup,
            gender,
            patientEmail,
            patientMobile,
            doctorName,
            payAmount,
            sampleReceived,
            patientAddress,
       
         } = await request.json();

         const patient = await PatientRegistration.create({
      receptionsName,
      patientname,
      fatherOrHusbandName,
      pateintAge,
      years_month_day,
      cnic,
      bloodGroup,
      gender,
      patientEmail,
      patientMobile,
      doctorName,
      payAmount,
      sampleReceived,
      patientAddress,
    });

    return NextResponse.json(
      { message: "Patient registered successfully", patient },
      { status: 201 }
    );

         

    } catch (error) {
       return NextResponse.json(
        {message: "Error while patient registration", error: error}, 
        {status: 500}
    )  
    }
}
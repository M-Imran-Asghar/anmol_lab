import { NextRequest, NextResponse } from "next/server";
import { connectionToDB } from "@/lib/db";
import User from "@/models/user";

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json()

    if(!email || !password || !name) {
        return NextResponse.json({message: "email, password and name is required"}, {status: 400})
    }

    await connectionToDB()

    const existingUser = await User.findOne({email})

    if(existingUser){
        return NextResponse.json({message: "User already exists"}, {status: 400})
    }

    await User.create({
            email, 
            password, 
            name
        })

        return NextResponse.json(
            {message: "User created successfully"},
            {status: 200}
        )
    } catch (error) {        
        return NextResponse.json(
            {mesaage: "Error while resgister user", error},
            {status: 500}
        )
    }
}
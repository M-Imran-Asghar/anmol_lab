import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { connectionToDB } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; isAdmin?: boolean };
    
    if (!decoded.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectionToDB();
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Error fetching users", error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; isAdmin?: boolean };
    
    if (!decoded.isAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectionToDB();

    const { name, email, password, isAdmin } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const user = new User({ name, email, password, isAdmin: isAdmin || false });
    await user.save();

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Error creating user", error: errorMessage }, { status: 500 });
  }
}

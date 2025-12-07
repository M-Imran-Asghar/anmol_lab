import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { connectionToDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;

// JWT_SECRET= abcdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ

export async function POST(request: NextRequest) {
  try {
    await connectionToDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "email and password is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const response = NextResponse.json(
      { message: "User logged in successfully" },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error while login user", error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectionToDB } from "@/lib/db";
import LabTest from "@/models/labTest";

const JWT_SECRET = process.env.JWT_SECRET!;

type DecodedToken = {
  userId: string;
  isAdmin?: boolean;
};

function getDecodedToken(token: string | undefined): DecodedToken | null {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch {
    return null;
  }
}

async function requireAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const decoded = getDecodedToken(token);

  if (!decoded) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true as const, decoded };
}

async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);

  if (!auth.ok) {
    return auth;
  }

  if (!auth.decoded.isAdmin) {
    return {
      ok: false as const,
      response: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}

function normalizeSubTests(subTests: unknown) {
  if (!Array.isArray(subTests)) {
    return [];
  }

  return subTests
    .map((subTest) => {
      if (!subTest || typeof subTest !== "object") {
        return null;
      }

      const item = subTest as { name?: unknown; referenceRange?: unknown; unit?: unknown };
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const referenceRange =
        typeof item.referenceRange === "string" ? item.referenceRange.trim() : "";
      const unit = typeof item.unit === "string" ? item.unit.trim() : "";

      if (!name) {
        return null;
      }

      return { name, referenceRange, unit };
    })
    .filter((subTest): subTest is { name: string; referenceRange: string; unit: string } => Boolean(subTest));
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await connectionToDB();
    const tests = await LabTest.find({}).sort({ name: 1 });
    return NextResponse.json({ tests }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Error fetching tests", error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await connectionToDB();
    const body = await request.json();

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const sample = typeof body.sample === "string" ? body.sample.trim() : "";
    const price = Number(body.price);
    const subTests = normalizeSubTests(body.subTests);

    if (!name || !code || !sample || Number.isNaN(price)) {
      return NextResponse.json({ message: "Name, code, sample, and price are required" }, { status: 400 });
    }

    const existingTest = await LabTest.findOne({
      $or: [{ name }, { code }],
    });

    if (existingTest) {
      return NextResponse.json({ message: "A test with this name or code already exists" }, { status: 400 });
    }

    const test = await LabTest.create({
      name,
      code,
      sample,
      price,
      subTests,
    });

    return NextResponse.json({ message: "Test created successfully", test }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Error creating test", error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await connectionToDB();
    const body = await request.json();

    const id = typeof body.id === "string" ? body.id : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const sample = typeof body.sample === "string" ? body.sample.trim() : "";
    const price = Number(body.price);
    const subTests = normalizeSubTests(body.subTests);

    if (!id || !name || !code || !sample || Number.isNaN(price)) {
      return NextResponse.json({ message: "Id, name, code, sample, and price are required" }, { status: 400 });
    }

    const duplicateTest = await LabTest.findOne({
      _id: { $ne: id },
      $or: [{ name }, { code }],
    });

    if (duplicateTest) {
      return NextResponse.json({ message: "A test with this name or code already exists" }, { status: 400 });
    }

    const updatedTest = await LabTest.findByIdAndUpdate(
      id,
      {
        name,
        code,
        sample,
        price,
        subTests,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTest) {
      return NextResponse.json({ message: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Test updated successfully", test: updatedTest }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Error updating test", error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    await connectionToDB();
    const { id } = await request.json();

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Test id is required" }, { status: 400 });
    }

    const deletedTest = await LabTest.findByIdAndDelete(id);

    if (!deletedTest) {
      return NextResponse.json({ message: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Test deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Error deleting test", error: errorMessage }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET() {
  try {
    const navigationItems = await prisma.navigation.findMany({
      orderBy: { order: "asc" },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(successResponse(navigationItems));
  } catch (error) {
    return NextResponse.json(errorResponse("Failed to fetch navigation items"), { status: 500 });
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(errorResponse("Not authenticated"), { status: 401 });
  }

  try {
    const data = await request.json();

    const newItem = await prisma.navigation.create({
      data: {
        ...data,
        createdById: currentUser.id,
        roles: JSON.stringify(data.roles),
      },
    });

    return NextResponse.json(successResponse(newItem));
  } catch (error) {
    console.error("Error creating navigation item:", error);
    return NextResponse.json(errorResponse("Failed to create navigation item"), { status: 500 });
  }
}

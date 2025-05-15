import { NextResponse } from "next/server";
import prisma from "@/lib/prismaClient";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(errorResponse("Not authenticated"), { status: 401 });
  }

  try {
    const data = await request.json();

    const updatedItem = await prisma.navigation.update({
      where: { id: params.id },
      data: {
        ...data,
        updatedById: currentUser.id,
        roles: JSON.stringify(data.roles),
      },
    });

    return NextResponse.json(successResponse(updatedItem));
  } catch (error) {
    console.error("Error updating navigation item:", error);
    return NextResponse.json(errorResponse("Failed to update navigation item"), { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(errorResponse("Not authenticated"), { status: 401 });
  }

  try {
    await prisma.navigation.delete({
      where: { id: params.id },
    });

    return NextResponse.json(successResponse("Navigation item deleted"));
  } catch (error) {
    console.error("Error deleting navigation item:", error);
    return NextResponse.json(errorResponse("Failed to delete navigation item"), { status: 500 });
  }
}

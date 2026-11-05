import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordReset } from "@/lib/password-reset";
import { validateEmail } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account uses that email." },
        { status: 404 },
      );
    }

    const token = await createPasswordReset(user.id);
    const origin = new URL(request.url).origin;

    return NextResponse.json({
      resetUrl: `${origin}/reset-password?token=${encodeURIComponent(token)}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Could not start a password reset. Please try again." },
      { status: 500 },
    );
  }
}

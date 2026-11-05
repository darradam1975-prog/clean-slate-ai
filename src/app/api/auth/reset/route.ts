import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { consumePasswordReset } from "@/lib/password-reset";
import { validatePassword } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");

    if (!token) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired." },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const result = await consumePasswordReset(token, password);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await createSession(result.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Could not reset the password. Please try again." },
      { status: 500 },
    );
  }
}

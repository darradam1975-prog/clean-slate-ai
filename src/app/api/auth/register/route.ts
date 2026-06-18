import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  hashPassword,
} from "@/lib/auth";
import { generateRandomAvatar, publicUserSelect } from "@/lib/identity";
import { generateUniqueUsername } from "@/lib/usernames";
import { validateEmail, validatePassword } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const username = await generateUniqueUsername();
    const avatar = generateRandomAvatar();
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        username,
        avatarKind: avatar.avatarKind,
        avatarStyle: avatar.avatarStyle,
      },
      select: publicUserSelect,
    });

    await createSession(user.id);

    return NextResponse.json({
      user,
      message: `Welcome! Your permanent username is ${username} with a random ${avatar.avatarStyle} ${avatar.avatarKind} profile picture.`,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveMediaBuffer } from "@/lib/media";
import { applyNoAiWatermark } from "@/lib/noai-watermark";
import {
  moderateImage,
  moderateTitleOnly,
  moderateVideoFrame,
} from "@/lib/sfw-moderation";
import { validateTitle } from "@/lib/validation";
import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          username: true,
          avatarKind: true,
          avatarStyle: true,
        },
      },
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upload." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "");
    const source = String(formData.get("source") ?? "computer");
    const declaredAiRaw = formData.get("declaredAi");
    const userDeclaredAi =
      declaredAiRaw === "1" ||
      declaredAiRaw === "true" ||
      declaredAiRaw === "on";
    const durationRaw = formData.get("durationSeconds");
    const file = formData.get("file");
    const previewFrame = formData.get("previewFrame");

    if (!userDeclaredAi) {
      return NextResponse.json(
        { error: "Check “I made this with AI” to confirm your upload." },
        { status: 400 },
      );
    }

    const titleError = validateTitle(title);
    if (titleError) {
      return NextResponse.json({ error: titleError }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }

    const durationSeconds =
      durationRaw != null && durationRaw !== ""
        ? Number(durationRaw)
        : null;

    let buffer = Buffer.from(await file.arrayBuffer());
    let mimeType = file.type || "application/octet-stream";

    let sfwResult;

    if (mimeType.startsWith("image/")) {
      sfwResult = await moderateImage(buffer, title);
      const watermarked = await applyNoAiWatermark(buffer, mimeType);
      buffer = Buffer.from(watermarked.buffer);
      mimeType = watermarked.mimeType;
    } else {
      const titleCheck = moderateTitleOnly(title);
      if (!titleCheck.isSfw) {
        return NextResponse.json(
          {
            error: "Upload rejected: content must be safe for work.",
            details: titleCheck,
          },
          { status: 422 },
        );
      }

      if (previewFrame instanceof File) {
        const frameBuffer = Buffer.from(await previewFrame.arrayBuffer());
        sfwResult = await moderateVideoFrame(frameBuffer, title);
      } else {
        sfwResult = titleCheck;
      }
    }

    if (!sfwResult.isSfw) {
      return NextResponse.json(
        {
          error: "Upload rejected: content must be safe for work.",
          details: {
            sfwConfidence: sfwResult.confidence,
            signals: sfwResult.signals,
          },
        },
        { status: 422 },
      );
    }

    let saved;
    try {
      saved = await saveMediaBuffer(buffer, mimeType, durationSeconds);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid file." },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        mediaType: saved.mediaType,
        mediaPath: saved.mediaPath,
        mimeType: saved.mimeType,
        fileSize: saved.fileSize,
        durationSeconds: saved.durationSeconds,
        isAiGenerated: true,
        aiConfidence: 1,
        aiSignals: JSON.stringify(["Trust mod: creator confirmed AI-generated"]),
        userDeclaredAi: true,
        isSfw: sfwResult.isSfw,
        sfwConfidence: sfwResult.confidence,
        sfwSignals: JSON.stringify(sfwResult.signals),
        status: "approved",
        source: source === "google_drive" ? "google_drive" : "computer",
        userId: user.id,
      },
      include: {
        user: {
          select: {
            username: true,
            avatarKind: true,
            avatarStyle: true,
          },
        },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
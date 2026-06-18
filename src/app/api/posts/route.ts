import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { detectAiContent } from "@/lib/ai-detection";
import { mergeAiResults } from "@/lib/merge-ai-results";
import { saveMediaBuffer } from "@/lib/media";
import { detectVisualAi } from "@/lib/visual-ai-detection";
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    let saved;
    try {
      saved = await saveMediaBuffer(buffer, mimeType, durationSeconds);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid file." },
        { status: 400 },
      );
    }

    let sfwResult;
    let metadataAi;
    let aiScanBuffer = buffer;
    let aiScanMime = mimeType;

    if (saved.mediaType === "image") {
      sfwResult = await moderateImage(buffer, title);
      metadataAi = await detectAiContent(buffer, mimeType);
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
        aiScanBuffer = frameBuffer;
        aiScanMime = previewFrame.type || "image/jpeg";
        sfwResult = await moderateVideoFrame(frameBuffer, title);
        metadataAi = await detectAiContent(aiScanBuffer, aiScanMime);
      } else {
        sfwResult = titleCheck;
        metadataAi = await detectAiContent(buffer, mimeType);
      }
    }

    const visualAi = aiScanMime.startsWith("image/")
      ? await detectVisualAi(aiScanBuffer, aiScanMime)
      : { used: false, score: 0, topGenerator: null, signals: [] };

    const aiResult = mergeAiResults(metadataAi, visualAi, userDeclaredAi);

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

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        mediaType: saved.mediaType,
        mediaPath: saved.mediaPath,
        mimeType: saved.mimeType,
        fileSize: saved.fileSize,
        durationSeconds: saved.durationSeconds,
        isAiGenerated: aiResult.isAiGenerated,
        aiConfidence: aiResult.confidence,
        aiSignals: JSON.stringify(aiResult.signals),
        userDeclaredAi,
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
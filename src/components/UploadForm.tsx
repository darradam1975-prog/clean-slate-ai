"use client";

import { NoAiMark } from "@/components/NoAiMark";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

const MAX_VIDEO_SECONDS = 30;

async function extractVideoPreview(
  file: File,
): Promise<{ duration: number; preview: Blob | null }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration > MAX_VIDEO_SECONDS) {
        URL.revokeObjectURL(url);
        resolve({ duration, preview: null });
        return;
      }

      video.currentTime = Math.min(1, duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve({ duration: video.duration, preview: null });
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve({ duration: video.duration, preview: blob });
        },
        "image/jpeg",
        0.85,
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ duration: 0, preview: null });
    };
  });
}

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [declaredAi, setDeclaredAi] = useState(false);
  const [noAiMark, setNoAiMark] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoPreview, setVideoPreview] = useState<Blob | null>(null);

  async function handleFileChange(selected: File | null) {
    setError(null);
    setSuccess(null);
    setVideoDuration(null);
    setVideoPreview(null);

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));

    if (selected.type.startsWith("video/")) {
      const { duration, preview } = await extractVideoPreview(selected);
      setVideoDuration(duration);
      setVideoPreview(preview);

      if (duration > MAX_VIDEO_SECONDS) {
        setError("Video clips must be 30 seconds or shorter.");
      }
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("A title is required for every upload.");
      return;
    }

    if (!file) {
      setError("Choose a file from your computer.");
      return;
    }

    if (file.type.startsWith("video/") && (videoDuration ?? 0) > MAX_VIDEO_SECONDS) {
      setError("Video clips must be 30 seconds or shorter.");
      return;
    }

    if (!declaredAi) {
      setError("Check “I made this with AI” to confirm your upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("file", file);
      formData.append("declaredAi", declaredAi ? "1" : "0");
      formData.append("noAiMark", noAiMark ? "1" : "0");

      if (videoDuration != null) {
        formData.append("durationSeconds", String(videoDuration));
      }

      if (videoPreview) {
        formData.append(
          "previewFrame",
          new File([videoPreview], "preview.jpg", { type: "image/jpeg" }),
        );
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      setSuccess("Upload approved and published!");
      setTitle("");
      setDeclaredAi(false);
      setNoAiMark(true);
      setFile(null);
      setPreviewUrl(null);
      setVideoDuration(null);
      setVideoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => router.push("/"), 1200);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-violet-900/20 sm:p-8"
    >
      <div>
        <h1 className="text-2xl font-semibold text-white">Share your creation</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Share AI art with the feed. Confirm the piece is AI-made. The noAI
          checkmark is on by default and stamps a protection mark on the image.
          Uncheck it to publish without the mark. Content must be safe for work.
          Short video clips up to 30 seconds are welcome.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/25 bg-violet-500/5 px-4 py-3 transition hover:border-violet-400/40">
        <input
          type="checkbox"
          checked={declaredAi}
          onChange={(e) => setDeclaredAi(e.target.checked)}
          required
          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-400/40"
        />
        <span>
          <span className="text-sm font-medium text-zinc-200">
            I made this with AI <span className="text-fuchsia-300">*</span>
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
            Required trust confirmation. By checking this you confirm the upload is
            AI-generated and agree it will carry a noAI protection mark.
          </span>
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/20">
        <input
          type="checkbox"
          checked={noAiMark}
          onChange={(e) => setNoAiMark(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-400/40"
        />
        <span>
          <span className="text-sm font-medium text-zinc-200">noAI checkmark</span>
          <span className="mt-1 block text-xs leading-relaxed text-zinc-500">
            On by default. Stamps a noAI protection mark on the image. Uncheck to
            share this piece without the mark.
          </span>
        </span>
      </label>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-zinc-200">
          Title <span className="text-fuchsia-300">*</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
          placeholder="Give your image or clip a title"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none ring-violet-400/0 transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-zinc-200">Media</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-xl border border-dashed border-violet-400/40 bg-violet-500/5 px-4 py-6 text-sm text-violet-100 transition hover:border-violet-300/70 hover:bg-violet-500/10"
        >
          Upload from computer
        </button>
        <p className="text-xs text-zinc-500">Images and short videos from your computer.</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        {file && (
          <p className="text-sm text-zinc-400">
            Selected: <span className="text-zinc-200">{file.name}</span>
          </p>
        )}
      </div>

      {previewUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {file?.type.startsWith("video/") ? (
            <video src={previewUrl} controls className="max-h-80 w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="max-h-80 w-full object-contain" />
          )}
          {noAiMark && <NoAiMark />}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Publish to feed"}
      </button>
    </form>
  );
}
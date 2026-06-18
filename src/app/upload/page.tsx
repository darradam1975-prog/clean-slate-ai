import { Avatar } from "@/components/Avatar";
import { Header } from "@/components/Header";
import { UploadForm } from "@/components/UploadForm";
import { getCurrentUser } from "@/lib/auth";
import type { AvatarKind } from "@/lib/identity";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#07080f]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3 text-sm text-zinc-400">
          <Avatar
            kind={user.avatarKind as AvatarKind}
            style={user.avatarStyle}
            username={user.username}
            size="md"
          />
          <p>
            Signed in as{" "}
            <Link href="/profile" className="font-medium text-violet-200 hover:text-violet-100">
              {user.username}
            </Link>
            <span className="text-zinc-600">
              {" "}
              · permanent username &amp; profile picture
            </span>
          </p>
        </div>
        <UploadForm />
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-zinc-500">
          Need Google Drive imports? Add{" "}
          <code className="text-zinc-400">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> and{" "}
          <code className="text-zinc-400">NEXT_PUBLIC_GOOGLE_API_KEY</code> to{" "}
          <code className="text-zinc-400">.env.local</code>.{" "}
          <Link href="/" className="text-violet-300 hover:text-violet-200">
            Back to gallery
          </Link>
        </p>
      </main>
    </div>
  );
}
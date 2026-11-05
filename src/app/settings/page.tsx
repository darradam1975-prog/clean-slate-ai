import { CloseSettings } from "@/components/CloseSettings";
import { Header } from "@/components/Header";
import { SettingsForm } from "@/components/SettingsForm";
import { getCurrentUser } from "@/lib/auth";
import { isSiteOwner } from "@/lib/owner";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#07080f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_40%)]" />
      <Header />
      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
              Site
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Settings</h1>
          </div>
          <CloseSettings />
        </div>
        {isSiteOwner(user.email) ? (
          <div className="mt-8">
            <SettingsForm />
          </div>
        ) : (
          <p className="mt-6 text-sm text-zinc-400">
            Only the site owner can change settings.{" "}
            <Link href="/" className="text-violet-300 hover:text-violet-200">
              Back to the feed
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}

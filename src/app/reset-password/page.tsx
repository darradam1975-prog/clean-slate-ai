import { Header } from "@/components/Header";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const tokenParam = (await searchParams).token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] ?? "" : tokenParam ?? "";

  return (
    <div className="min-h-screen bg-[#07080f]">
      <Header />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12 sm:px-6">
        <ResetPasswordForm token={token} />
      </main>
    </div>
  );
}

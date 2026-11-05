import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { Header } from "@/components/Header";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#07080f]">
      <Header />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12 sm:px-6">
        <ForgotPasswordForm />
      </main>
    </div>
  );
}

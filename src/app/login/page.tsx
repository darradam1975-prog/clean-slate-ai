import { AuthForm } from "@/components/AuthForm";
import { Header } from "@/components/Header";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07080f]">
      <Header />
      <main className="mx-auto flex max-w-6xl justify-center px-4 py-12 sm:px-6">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
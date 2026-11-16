import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/features/auth/components/AuthShell";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getServerSession()) redirect("/dashboard");

  return (
    <AuthShell
      title="Create your account"
      subtitle="New accounts start as Viewers. An administrator can change your role."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="link link-primary">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

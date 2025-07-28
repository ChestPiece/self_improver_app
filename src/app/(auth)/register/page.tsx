import AuthPageClient from "@/components/auth/auth-page-client";
import RegisterForm from "@/components/auth/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthPageClient>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Start Your Journey
            </h1>
            <p className="text-muted-foreground">
              Create an account to begin your self-improvement journey
            </p>
          </div>

          <RegisterForm />

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthPageClient>
  );
}

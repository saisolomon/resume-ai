import { SignIn } from "@clerk/nextjs";

// Honor ?redirect_url=... so the /run/* gates can bounce the user to
// the page they were trying to open instead of the default dashboard.
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6 py-16">
      <SignIn fallbackRedirectUrl={redirect_url || "/dashboard"} />
    </div>
  );
}

import { SignUp } from "@clerk/nextjs";

// Honor ?redirect_url=... so post-signup links from /pricing or the
// /run/* gates land the user where they started.
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6 py-16">
      <SignUp fallbackRedirectUrl={redirect_url || "/dashboard"} />
    </div>
  );
}

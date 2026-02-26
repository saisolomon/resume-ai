"use client";

interface ResumeHeaderProps {
  name: string;
  contactLine1: string;
  contactLine2?: string;
}

export function ResumeHeader({
  name,
  contactLine1,
  contactLine2,
}: ResumeHeaderProps) {
  return (
    <header className="mb-[0.4em] text-center">
      <h1
        className="font-bold leading-[1.2]"
        style={{ fontSize: "1.17rem" }}
      >
        {name}
      </h1>
      <p
        className="mt-[0.15em] leading-[1.3] text-black"
        style={{ fontSize: "0.83rem" }}
      >
        {contactLine1}
      </p>
      {contactLine2 && (
        <p
          className="leading-[1.3] text-black"
          style={{ fontSize: "0.83rem" }}
        >
          {contactLine2}
        </p>
      )}
    </header>
  );
}

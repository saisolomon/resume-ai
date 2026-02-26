"use client";

interface ResumeBulletProps {
  text: string;
}

export function ResumeBullet({ text }: ResumeBulletProps) {
  return (
    <li
      className="relative pl-[1.1em] leading-[1.3]"
      style={{ fontSize: "0.83rem" }}
    >
      <span
        className="absolute left-0 top-0 select-none"
        aria-hidden="true"
      >
        &bull;
      </span>
      {text}
    </li>
  );
}

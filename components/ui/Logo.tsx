export function LogoIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M32 2C19.85 2 10 11.85 10 24c0 16.5 22 38 22 38s22-21.5 22-38C54 11.85 44.15 2 32 2z"
        fill="currentColor"
      />
      <circle cx="32" cy="19" r="6" fill="white" />
      <path
        d="M24 33c0-4.42 3.58-8 8-8s8 3.58 8 8"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

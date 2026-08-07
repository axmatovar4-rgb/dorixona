import { cn } from "@/lib/utils";

type LogoProps = { className?: string };

export function PaymeLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 34" className={cn("h-6 w-auto", className)} aria-label="Payme">
      <text x="0" y="25" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="26" fill="#1A1A1A">
        Pay
      </text>
      <path
        d="M64 4h38a13 13 0 0 1 0 26H64a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
        fill="#00C9B7"
      />
      <path d="M100 8.5 108 17l-8 8.5v-17Z" fill="#00C9B7" />
      <text x="68" y="24.5" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="19" fill="#FFFFFF">
        me
      </text>
    </svg>
  );
}

export function ClickLogo({ className }: LogoProps) {
  const gid = "click-grad";
  return (
    <svg viewBox="0 0 130 34" className={cn("h-6 w-auto", className)} aria-label="Click">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3AC4F2" />
          <stop offset="100%" stopColor="#0052D9" />
        </linearGradient>
      </defs>
      <circle cx="17" cy="17" r="15" fill="none" stroke={`url(#${gid})`} strokeWidth="7" />
      <text x="42" y="24.5" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="21" fill="#0B2E6B">
        click
      </text>
    </svg>
  );
}

export function HumoLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 120 34" className={cn("h-6 w-auto", className)} aria-label="Humo">
      <path d="M4 22c3-6 3-12 0-18 5 2 8 7 8 13s-3 9-8 5Z" fill="#D9B45C" opacity="0.55" />
      <path d="M12 24c3-7 3-14 0-21 5 2 9 8 9 15s-4 10-9 6Z" fill="#C79A3E" opacity="0.8" />
      <text x="22" y="25" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="22" fill="#B8862F" letterSpacing="1">
        HUMO
      </text>
    </svg>
  );
}

export function UzcardLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 96 40" className={cn("h-8 w-auto", className)} aria-label="Uzcard">
      <path
        d="M22 4v16a10 10 0 0 0 20 0V4h-6v16a4 4 0 0 1-8 0V4h-6Z"
        fill="#1E3F8F"
      />
      <circle cx="48" cy="8" r="5" fill="#F4901E" />
      <text x="16" y="36" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="#1E3F8F" letterSpacing="1.5">
        UZCARD
      </text>
    </svg>
  );
}

export function VisaLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 100 34" className={cn("h-6 w-auto", className)} aria-label="Visa">
      <path d="M4 26c6-6 6-14 0-22 7 2 12 9 12 16.5S11 28 4 26Z" fill="#F7A823" />
      <text x="14" y="25" fontFamily="Arial, sans-serif" fontWeight="800" fontStyle="italic" fontSize="24" fill="#1A3A8F" letterSpacing="-0.5">
        VISA
      </text>
    </svg>
  );
}

export function CashCoinIcon({ className }: LogoProps) {
  const gid = "coin-grad";
  return (
    <svg viewBox="0 0 40 40" className={cn("h-6 w-6", className)} aria-label="Naqd">
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FDE79A" />
          <stop offset="55%" stopColor="#F2C247" />
          <stop offset="100%" stopColor="#C4901C" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#${gid})`} stroke="#A9791A" strokeWidth="1" />
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="#A9791A" strokeWidth="1" opacity="0.6" />
      <circle cx="20" cy="20" r="9" fill="none" stroke="#A9791A" strokeWidth="0.75" opacity="0.4" />
    </svg>
  );
}

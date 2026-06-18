// Minimal inline icon set (lucide-style geometry, ISC-equivalent paths). Local
// SVGs instead of the lucide-react barrel, which doesn't tree-shake under the
// IIFE lib build and would inline the entire icon library (~150KB).

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const X = (p: IconProps) => (
  <Icon {...p}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>
);

export const Check = (p: IconProps) => (
  <Icon {...p}><path d="M20 6 9 17l-5-5" /></Icon>
);

export const Moon = (p: IconProps) => (
  <Icon {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Icon>
);

export const Sun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </Icon>
);

export const PanelRightClose = (p: IconProps) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" /><path d="m8 9 3 3-3 3" />
  </Icon>
);

export const PanelRightOpen = (p: IconProps) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M15 3v18" /><path d="m10 15-3-3 3-3" />
  </Icon>
);

export const MessageSquare = (p: IconProps) => (
  <Icon {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon>
);

export const Server = (p: IconProps) => (
  <Icon {...p}>
    <rect width="20" height="8" x="2" y="2" rx="2" /><rect width="20" height="8" x="2" y="14" rx="2" />
    <path d="M6 6h.01" /><path d="M6 18h.01" />
  </Icon>
);

export const Component = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15.5 7.5 19 4l1.5 1.5L17 9z" /><path d="m12 12 3.5-3.5" />
    <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </Icon>
);

export const Sparkle = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" />
    <path d="m6.3 6.3 2.4 2.4" /><path d="m15.3 15.3 2.4 2.4" />
    <path d="m17.7 6.3-2.4 2.4" /><path d="m8.7 15.3-2.4 2.4" />
  </Icon>
);

export const Keyboard = (p: IconProps) => (
  <Icon {...p}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M6 9h.01" /><path d="M10 9h.01" /><path d="M14 9h.01" /><path d="M18 9h.01" />
    <path d="M7 13h10" />
  </Icon>
);

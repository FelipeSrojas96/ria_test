/** Shared Tailwind class constants — edit here to restyle the whole app */

export const CARD =
  "bg-gradient-to-b from-white/[0.12] to-glass-subtle border border-stroke rounded-card p-[18px] shadow-card backdrop-blur-xl";

export const ERROR =
  "px-3 py-2.5 rounded-pill bg-red-500/[0.18] border border-red-400/35";

export const SKELETON = "rounded-skeleton animate-pulse bg-glass";

export const PILL_BASE =
  "flex-1 px-2 py-2 rounded-pill border cursor-pointer font-bold text-primary transition-all duration-[120ms] hover:-translate-y-px";

export const PILL_ACTIVE = "bg-white/[0.22] border-stroke-bright";

export const PILL_INACTIVE = "bg-transparent border-transparent hover:bg-white/[0.16]";

export const SEARCH_WRAPPER =
  "flex gap-2 items-center px-3 py-[10px] rounded-input border border-white/[0.15] bg-black/20 backdrop-blur-lg";

export const REFRESH_BTN =
  "flex-none w-10 h-10 flex items-center justify-center rounded-xl bg-glass border border-white/[0.18] text-primary cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed transition-transform duration-200 hover:-rotate-180 disabled:hover:rotate-0";

export const DROPDOWN =
  "absolute top-[calc(100%+8px)] left-0 right-0 rounded-input border border-white/[0.12] bg-surface overflow-hidden shadow-dropdown z-50 empty:hidden";

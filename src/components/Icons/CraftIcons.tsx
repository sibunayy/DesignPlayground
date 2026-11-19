import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/** Custom Sightline geometric optical viewfinder & centroid emblem */
export const SightlineEmblem: React.FC<IconProps> = ({ size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="26" height="26" rx="5" stroke="currentColor" strokeWidth="1.75" />
    <rect
      x="7.5"
      y="7.5"
      width="17"
      height="17"
      rx="2"
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="1.25"
    />
    <path d="M16 1V8M16 24V31M1 16H8M24 16H31" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="16" cy="16" r="2.75" fill="var(--accent)" />
  </svg>
);

export const SquintEyeIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M2.5 10C4.5 6.5 7 5 10 5C13 5 15.5 6.5 17.5 10C15.5 13.5 13 15 10 15C7 15 4.5 13.5 2.5 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 16.5H16" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

export const AchromatopsiaIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 3A7 7 0 0 1 10 17V3Z" fill="currentColor" />
    <path d="M10 6.5L13.5 10L10 13.5" stroke="var(--bg-surface)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const MirrorAxisIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2.5V17.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    <polygon points="3,14 8,6 8,14" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <polygon points="17,14 12,6 12,14" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

export const FineTuneDialIcon: React.FC<IconProps> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 5.5H17M3 10H17M3 14.5H17" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="7" cy="5.5" r="2" fill="var(--bg-surface)" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="13.5" cy="10" r="2" fill="var(--accent)" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="14.5" r="2" fill="var(--bg-surface)" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const DailyMixCalibratorIcon: React.FC<IconProps> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
    <path d="M7 15V11M12 15V8M17 15V12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

/** Bespoke craft discipline glyph for each of the 13 lessons */
export const LessonCraftIcon: React.FC<{ lessonId: string; size?: number }> = ({
  lessonId,
  size = 24,
}) => {
  switch (lessonId) {
    case '01-whitespace':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="7" y="7" width="6" height="6" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.3" />
          <path d="M15 15L19 19M19 15V19H15" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case '02-hierarchy':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="14" height="3.5" rx="1" fill="currentColor" />
          <rect x="3" y="9.5" width="18" height="2" rx="1" fill="currentColor" fillOpacity="0.4" />
          <rect x="3" y="16" width="10" height="4" rx="2" fill="var(--accent)" />
          <path d="M19.5 11.5V16" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case '03-grids':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="4.5" height="16" rx="1" stroke="currentColor" strokeWidth="1.4" />
          <rect x="9.75" y="4" width="4.5" height="16" rx="1" stroke="var(--accent)" strokeWidth="1.4" />
          <rect x="16.5" y="4" width="4.5" height="16" rx="1" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    case '04-macro-type':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6H16M4 10.5H19M4 15H17M4 19.5H12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M20.5 6V19.5" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case '05-font-pairing':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.2" />
          <line x1="2" y1="10" x2="22" y2="10" stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="2.5 2" />
          <text x="3" y="17.5" fontSize="13" fontFamily="Georgia, serif" fontWeight="700" fill="currentColor">A</text>
          <text x="13" y="17.5" fontSize="11" fontFamily="sans-serif" fontWeight="600" fill="var(--accent)">a</text>
        </svg>
      );
    case '06-paragraph-flow':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 5.5H19M3 10H15M3 14.5H18M3 19H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="13.5" cy="19" r="1.75" fill="var(--accent)" />
          <path d="M18 4.5C20 7.5 16 11 19 14.5C20.5 16.2 19 18 17 19" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case '07-micro-type':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 17L7 6L11 17M4.5 13.5H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 6L17 17L21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 20.5H14.5M10.5 19.5L9.5 20.5L10.5 21.5M13.5 19.5L14.5 20.5L13.5 21.5" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case '08-character-hygiene':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 7C6.2 7 5 8.2 5 10C5 11.4 6 12.2 7.2 12.2C8 12.2 8.5 12.8 8.3 13.8C8 15 6.8 16 5.5 16.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M13.5 12H19.5" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16.5" cy="7.5" r="1.3" fill="currentColor" />
          <circle cx="16.5" cy="16.5" r="1.3" fill="currentColor" />
        </svg>
      );
    case '09-optical-geometry':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
          <polygon points="10,8.5 10,15.5 16.2,12" fill="var(--accent)" />
          <path d="M12 2.5V5M12 19V21.5" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.3" />
        </svg>
      );
    case '10-perceptual-color':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9.5" cy="12" r="5.5" fill="var(--accent)" fillOpacity="0.22" stroke="var(--accent)" strokeWidth="1.5" />
          <circle cx="14.5" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 7.5V16.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
        </svg>
      );
    case '11-iconography':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.3" strokeDasharray="2 2" />
          <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="10.5" y="5" width="3" height="3" fill="var(--accent)" />
          <rect x="10.5" y="16" width="3" height="3" fill="var(--accent)" />
        </svg>
      );
    case '12-image-framing':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 9V4H9M15 4H20V9M20 15V20H15M9 20H4V15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="2.2" fill="var(--accent)" />
          <path d="M7.5 17C8.5 14.8 10 14 12 14C14 14 15.5 14.8 16.5 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case '13-print-prepress':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 2V22M2 12H22" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="2" fill="var(--accent)" />
        </svg>
      );
  }
};

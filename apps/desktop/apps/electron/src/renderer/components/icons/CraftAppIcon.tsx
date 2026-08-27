interface CraftAppIconProps {
  className?: string
  size?: number
}

/**
 * sapstack Desktop app icon — SAP-blue rounded square, white "S", gold bar.
 * Inline SVG mirror of resources/icon.svg so no asset import is needed.
 * The export name is retained internally to avoid a broad upstream component
 * rename, but no Craft artwork is rendered.
 */
export function CraftAppIcon({ className, size = 64 }: CraftAppIconProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="sapstack"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sapstack-app-icon-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A6ED1" />
          <stop offset="1" stopColor="#003B6F" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#sapstack-app-icon-bg)" />
      <path
        d="M10 8H54V18H24C20 18 18 20 18 23C18 26 20 28 24 28H42C51 28 56 34 56 44C56 54 49 60 38 60H10V50H38C43 50 46 48 46 44C46 40 43 38 38 38H24C14 38 8 32 8 23C8 14 14 8 24 8Z"
        transform="scale(8)"
        fill="#fff"
      />
      <path d="M416 64h24v416h-24z" fill="#F0AB00" opacity=".95" />
    </svg>
  )
}

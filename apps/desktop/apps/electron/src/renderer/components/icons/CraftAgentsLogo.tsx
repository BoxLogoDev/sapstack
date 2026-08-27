interface CraftAgentsLogoProps {
  className?: string
}

/**
 * sapstack pixel wordmark ("SAPSTACK", 5x7 pixel font, 9px cell) - uses accent
 * color from theme. Apply text-accent class to get the brand color.
 * The export name is retained internally to avoid a broad upstream component
 * rename, but no Craft artwork is rendered.
 */
export function CraftAgentsLogo({ className }: CraftAgentsLogoProps) {
  return (
    <svg
      viewBox="0 0 423 63"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 0h36v9h-36zM0 9h9v9h-9zM0 18h9v9h-9zM9 27h27v9h-27zM36 36h9v9h-9zM36 45h9v9h-9zM0 54h36v9h-36zM72 0h9v9h-9zM63 9h9v9h-9zM81 9h9v9h-9zM54 18h9v9h-9zM90 18h9v9h-9zM54 27h45v9h-45zM54 36h9v9h-9zM90 36h9v9h-9zM54 45h9v9h-9zM90 45h9v9h-9zM54 54h9v9h-9zM90 54h9v9h-9zM108 0h36v9h-36zM108 9h9v9h-9zM144 9h9v9h-9zM108 18h9v9h-9zM144 18h9v9h-9zM108 27h36v9h-36zM108 36h9v9h-9zM108 45h9v9h-9zM108 54h9v9h-9zM171 0h36v9h-36zM162 9h9v9h-9zM162 18h9v9h-9zM171 27h27v9h-27zM198 36h9v9h-9zM198 45h9v9h-9zM162 54h36v9h-36zM216 0h45v9h-45zM234 9h9v9h-9zM234 18h9v9h-9zM234 27h9v9h-9zM234 36h9v9h-9zM234 45h9v9h-9zM234 54h9v9h-9zM288 0h9v9h-9zM279 9h9v9h-9zM297 9h9v9h-9zM270 18h9v9h-9zM306 18h9v9h-9zM270 27h45v9h-45zM270 36h9v9h-9zM306 36h9v9h-9zM270 45h9v9h-9zM306 45h9v9h-9zM270 54h9v9h-9zM306 54h9v9h-9zM333 0h36v9h-36zM324 9h9v9h-9zM324 18h9v9h-9zM324 27h9v9h-9zM324 36h9v9h-9zM324 45h9v9h-9zM333 54h36v9h-36zM378 0h9v9h-9zM414 0h9v9h-9zM378 9h9v9h-9zM405 9h9v9h-9zM378 18h9v9h-9zM396 18h9v9h-9zM378 27h18v9h-18zM378 36h9v9h-9zM396 36h9v9h-9zM378 45h9v9h-9zM405 45h9v9h-9zM378 54h9v9h-9zM414 54h9v9h-9z"
        fill="currentColor"
        fillRule="nonzero"
      />
    </svg>
  )
}

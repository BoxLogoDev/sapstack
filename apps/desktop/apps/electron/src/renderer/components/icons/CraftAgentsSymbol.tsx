interface CraftAgentsSymbolProps {
  className?: string
}

/**
 * sapstack Desktop "S" symbol. The export name is retained internally to
 * avoid a broad upstream component rename, but no Craft artwork is rendered.
 */
export function CraftAgentsSymbol({ className }: CraftAgentsSymbolProps) {
  return (
    <svg
      viewBox="0 0 64 68"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 8H54V18H24C20 18 18 20 18 23C18 26 20 28 24 28H42C51 28 56 34 56 44C56 54 49 60 38 60H10V50H38C43 50 46 48 46 44C46 40 43 38 38 38H24C14 38 8 32 8 23C8 14 14 8 24 8Z"
        fill="currentColor"
        fillRule="nonzero"
      />
    </svg>
  )
}

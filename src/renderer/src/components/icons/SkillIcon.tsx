/**
 * Small original stroke-icon set for the 11 skills — hand-composed simple
 * glyphs (not Minecraft's own item textures, which is what M4's item-icon
 * pipeline will source separately and more carefully for inventory items
 * and the 100+ collection items, where licensing/sourcing needs real
 * thought). This set exists purely so the Skills tab isn't text-only.
 */
const PATHS: Record<string, React.ReactNode> = {
  farming: (
    <>
      <path d="M8 21V11" />
      <circle cx="8" cy="9" r="1.3" />
      <path d="M12 21V7" />
      <circle cx="12" cy="5" r="1.3" />
      <path d="M16 21V11" />
      <circle cx="16" cy="9" r="1.3" />
    </>
  ),
  mining: (
    <>
      <path d="M4.5 7c3-4 13-4 16 0" />
      <path d="M11 6 4.5 19.5" />
    </>
  ),
  combat: (
    <>
      <path d="M12 2v12" />
      <path d="M8.5 14.5h7" />
      <path d="M12 14.5V21" />
      <path d="M10 21h4" />
    </>
  ),
  foraging: (
    <path d="M12 3l4 6h-2.5l3.5 5h-3v3h-4v-3h-3l3.5-5H8z" />
  ),
  fishing: (
    <>
      <path d="M3 12c3-4 9-6 13-4-1 2-1 6 0 8-4 2-10 0-13-4z" />
      <circle cx="7.5" cy="11" r="0.6" fill="currentColor" stroke="none" />
      <path d="M16 8l4-2v12l-4-2" />
    </>
  ),
  enchanting: (
    <>
      <path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0z" />
      <path d="M21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z" />
    </>
  ),
  alchemy: (
    <>
      <path d="M10 2h4" />
      <path d="M10 2v4.5l-4.2 7.8A2.8 2.8 0 008.3 18.6h7.4a2.8 2.8 0 002.5-4.3L14 6.5V2" />
      <circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  taming: (
    <>
      <ellipse cx="12" cy="16" rx="3.6" ry="3.1" />
      <circle cx="6.5" cy="10" r="1.5" />
      <circle cx="10.3" cy="7" r="1.5" />
      <circle cx="14.7" cy="7" r="1.5" />
      <circle cx="18" cy="10" r="1.5" />
    </>
  ),
  carpentry: (
    <>
      <path d="M14.5 5.5l4 4-2.2 2.2-4-4z" />
      <path d="M13 9L4.5 17.5" />
    </>
  ),
  runecrafting: (
    <>
      <path d="M12 3l6 6-6 12-6-12z" />
      <path d="M6 9h12" />
      <path d="M9 9l3 12M15 9l-3 12" />
    </>
  ),
  social: <path d="M4.5 5a1 1 0 011-1h13a1 1 0 011 1v9a1 1 0 01-1 1H9.5l-4 4v-4h-0a1 1 0 01-1-1z" />,
  hunting: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  )
}

export default function SkillIcon({
  skill,
  size = 20
}: {
  skill: string
  size?: number
}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      aria-hidden="true"
    >
      {PATHS[skill] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}

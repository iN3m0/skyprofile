import SketchBox from './sketch/SketchBox'
import s from './Sidebar.module.css'

export type ToolId =
  'stats-viewer' | 'mp-calculator' | 'attribute-calculator' | 'museum-calculator' | 'xp-calculator'

interface ToolDef {
  id: ToolId
  label: string
  icon: string
  color: string
}

const TOOLS: ToolDef[] = [
  { id: 'stats-viewer', label: 'Stats Viewer', icon: '📊', color: 'var(--color-accent)' },
  { id: 'mp-calculator', label: 'MP Calculator', icon: '✦', color: '#e8a33d' },
  { id: 'attribute-calculator', label: 'Attribute Calculator', icon: '🔷', color: '#a56de2' },
  { id: 'museum-calculator', label: 'Museum Calculator', icon: '🏛️', color: '#c9a15a' },
  { id: 'xp-calculator', label: 'XP Calculator', icon: '⭐', color: '#8bc34a' }
]

/**
 * Persistent left rail of "tools" — quick single-purpose calculators
 * (MP Calculator) alongside a shortcut back to the full player-overview
 * tracker (Stats Viewer, the same view as the titlebar's Search tab).
 * Selecting a tool here overrides the main content area until a titlebar
 * tab is clicked again. Whichever tool/tab last set the player/profile
 * selection, the next one picks up right where it left off — see
 * `lib/playerSelection.ts`.
 */
export default function Sidebar({
  activeTool,
  onSelectTool
}: {
  activeTool: ToolId | null
  onSelectTool: (tool: ToolId) => void
}): React.JSX.Element {
  return (
    <aside className={s.sidebar}>
      <span className={`font-hand ${s.heading}`}>Tools</span>
      <div className={s.toolList}>
        {TOOLS.map((tool) => (
          <SketchBox
            key={tool.id}
            className={s.toolCard}
            stroke={activeTool === tool.id ? tool.color : 'var(--color-ink)'}
            strokeWidth={activeTool === tool.id ? 2.2 : 1.5}
          >
            <button
              type="button"
              onClick={() => onSelectTool(tool.id)}
              className={s.toolButton}
              title={tool.label}
            >
              <span className={s.toolIcon} style={{ color: tool.color }}>
                {tool.icon}
              </span>
              <span className={`font-hand ${s.toolLabel}`}>{tool.label}</span>
            </button>
          </SketchBox>
        ))}
      </div>
    </aside>
  )
}

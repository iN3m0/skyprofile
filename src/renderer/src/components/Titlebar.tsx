import SketchUnderline from './sketch/SketchUnderline'
import s from './Titlebar.module.css'

/**
 * Custom titlebar content. The window itself uses titleBarStyle: 'hidden' +
 * titleBarOverlay (see src/main/index.ts) — Windows still draws native
 * min/max/close buttons (themed), we just own everything left of them.
 * Reserves space on the right so our content never sits under those
 * buttons.
 */
export default function Titlebar({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return (
    <div className={`titlebar-drag ${s.bar}`}>
      <span className={s.brand}>
        Sky<span className={s.brandAccent}>Profile</span>
        <SketchUnderline className={s.underline} rainbow />
      </span>
      <div className={`titlebar-no-drag ${s.controls}`}>{children}</div>
    </div>
  )
}

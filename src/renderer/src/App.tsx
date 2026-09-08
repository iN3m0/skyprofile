import { useState } from 'react'
import Titlebar from './components/Titlebar'
import Sidebar, { type ToolId } from './components/Sidebar'
import SketchButton from './components/sketch/SketchButton'
import PlayerSearchPage from './pages/PlayerSearchPage'
import SettingsPage from './pages/SettingsPage'
import MpCalculatorTool from './tools/MpCalculatorTool'
import AttributeCalculatorTool from './tools/AttributeCalculatorTool'
import MuseumCalculatorTool from './tools/MuseumCalculatorTool'
import SkyblockXpCalculatorTool from './tools/SkyblockXpCalculatorTool'
import CalendarTool from './tools/CalendarTool'
import { EMPTY_SELECTION, type PlayerSelection } from './lib/playerSelection'
import s from './App.module.css'

type Tab = 'search' | 'settings'

export default function App(): React.JSX.Element {
  const [tab, setTab] = useState<Tab>('search')
  const [tool, setTool] = useState<ToolId | null>(null)
  // Which player/profile is "loaded" — shared by the Search tab's stats
  // tracker and any sidebar tool that also works off a player/profile, so
  // switching between them never means re-searching.
  const [selection, setSelection] = useState<PlayerSelection>(EMPTY_SELECTION)

  function selectTab(t: Tab): void {
    setTool(null)
    setTab(t)
  }

  return (
    <div className={s.app}>
      <Titlebar>
        <SketchButton
          variant={!tool && tab === 'search' ? 'primary' : 'default'}
          onClick={() => selectTab('search')}
          className={s.navButton}
        >
          Search
        </SketchButton>
        <SketchButton
          variant={!tool && tab === 'settings' ? 'primary' : 'default'}
          onClick={() => selectTab('settings')}
          className={s.navButton}
        >
          Settings
        </SketchButton>
      </Titlebar>
      <div className={s.body}>
        <Sidebar activeTool={tool} onSelectTool={setTool} />
        <main className={s.main}>
          {tool === 'mp-calculator' ? (
            <MpCalculatorTool selection={selection} setSelection={setSelection} />
          ) : tool === 'attribute-calculator' ? (
            <AttributeCalculatorTool selection={selection} setSelection={setSelection} />
          ) : tool === 'museum-calculator' ? (
            <MuseumCalculatorTool selection={selection} setSelection={setSelection} />
          ) : tool === 'xp-calculator' ? (
            <SkyblockXpCalculatorTool selection={selection} setSelection={setSelection} />
          ) : tool === 'calendar' ? (
            <CalendarTool />
          ) : tool === 'stats-viewer' ? (
            <PlayerSearchPage selection={selection} setSelection={setSelection} />
          ) : tab === 'search' ? (
            <PlayerSearchPage selection={selection} setSelection={setSelection} />
          ) : (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  )
}

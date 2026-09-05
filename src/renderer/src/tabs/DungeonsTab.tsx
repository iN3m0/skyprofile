import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import SketchProgress from '../components/sketch/SketchProgress'
import { MARKER_COLORS } from '../lib/skillColors'
import s from './DungeonsTab.module.css'

function formatMs(ms: number): string {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function DungeonsTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['dungeons', profileId, uuid],
    queryFn: () => api.member.getDungeons(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={6} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load dungeons.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return <p className={`font-hand ${s.emptyState}`}>this player has no dungeons data available for this profile.</p>
  }

  const {
    catacombsLevel,
    catacombsMaxLevel,
    catacombsXp,
    catacombsXpForNextLevel,
    catacombsProgress,
    secretsFound,
    highestFloorCompleted,
    normalFloors,
    masterFloors,
    classes
  } = query.data
  const catacombsMaxed = catacombsLevel >= catacombsMaxLevel

  return (
    <div className={s.sections}>
      <div className={s.statsRow}>
        <SketchBox className={s.statBox} stroke="var(--color-accent)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Catacombs Level</span>
            <span className={`font-tabular ${s.statValue}`}>
              {catacombsLevel} / {catacombsMaxLevel}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#e8a33d" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Secrets Found</span>
            <span className={`font-tabular ${s.statValue}`}>{secretsFound.toLocaleString()}</span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="var(--color-progress)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Highest Floor</span>
            <span className={`font-tabular ${s.statValue}`}>
              {highestFloorCompleted !== null ? (highestFloorCompleted === 0 ? 'Entrance' : `F${highestFloorCompleted}`) : '—'}
            </span>
          </div>
        </SketchBox>
      </div>

      <div>
        <div className={catacombsMaxed ? s.maxedBar : undefined}>
          <SketchProgress
            progress={catacombsMaxed ? 1 : catacombsProgress}
            color="var(--color-accent)"
            outlineColor="var(--color-accent)"
            height={14}
          />
        </div>
        <p className={`font-tabular ${s.xpLine}`}>
          {catacombsXp.toLocaleString()} XP
          {!catacombsMaxed && catacombsXpForNextLevel !== null && ` · ${catacombsXpForNextLevel.toLocaleString()} to next level`}
        </p>
      </div>

      <div>
        <h2 className={`font-hand ${s.sectionTitle}`}>Classes</h2>
        <div className={s.classGrid}>
          {classes.map((cls, i) => {
            const color = MARKER_COLORS[i % MARKER_COLORS.length]
            const maxed = cls.level >= cls.maxLevel
            return (
              <div key={cls.type} className={s.classRow}>
                <div className={s.classHeader}>
                  <span className={`font-hand ${s.className}`} style={{ color }}>
                    {cls.name}
                    {cls.selected && <span className={s.selectedBadge}> ★ selected</span>}
                  </span>
                  <span className={`font-tabular ${s.classMeta}`}>
                    Lv {cls.level}/{cls.maxLevel}
                  </span>
                </div>
                <div className={maxed ? s.maxedBar : undefined}>
                  <SketchProgress progress={maxed ? 1 : cls.progress} color={color} outlineColor={color} height={10} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={s.floorsGrid}>
        <div>
          <h2 className={`font-hand ${s.sectionTitle}`}>Catacombs Floors</h2>
          {normalFloors.length === 0 ? (
            <p className={`font-hand ${s.emptyState}`}>No floors completed yet.</p>
          ) : (
            <div className={s.floorList}>
              {normalFloors.map((floor) => (
                <div key={floor.floor} className={s.floorRow}>
                  <span className="font-hand">{floor.label}</span>
                  <span className={`font-tabular ${s.floorStats}`}>
                    {floor.completions.toLocaleString()}x
                    {floor.bestScore !== null && ` · ${floor.bestScore} score`}
                    {floor.fastestTimeMs !== null && ` · ${formatMs(floor.fastestTimeMs)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className={`font-hand ${s.sectionTitle}`}>Master Mode Floors</h2>
          {masterFloors.length === 0 ? (
            <p className={`font-hand ${s.emptyState}`}>No Master Mode floors completed yet.</p>
          ) : (
            <div className={s.floorList}>
              {masterFloors.map((floor) => (
                <div key={floor.floor} className={s.floorRow}>
                  <span className="font-hand">{floor.label}</span>
                  <span className={`font-tabular ${s.floorStats}`}>
                    {floor.completions.toLocaleString()}x
                    {floor.bestScore !== null && ` · ${floor.bestScore} score`}
                    {floor.fastestTimeMs !== null && ` · ${formatMs(floor.fastestTimeMs)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

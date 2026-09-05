import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import SketchBox from './sketch/SketchBox'
import { formatPrice } from '../lib/formatPrice'
import s from './PlayerOverviewStats.module.css'

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PlayerOverviewStats({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['overview', profileId, uuid],
    queryFn: () => api.member.getOverview(profileId, uuid)
  })
  const [levelHovered, setLevelHovered] = useState(false)
  const [networthHovered, setNetworthHovered] = useState(false)

  // This is supplementary header info, not a tab — fail quietly (no
  // spinner/error text cluttering the identity row) rather than blocking
  // on it; the rest of the app works fine without it.
  if (!query.data) return <></>

  const { skyblockLevel, networth, firstJoined, lastSeen } = query.data

  return (
    <div className={s.row}>
      {skyblockLevel && (
        <div
          className={s.statItem}
          onMouseEnter={() => setLevelHovered(true)}
          onMouseLeave={() => setLevelHovered(false)}
        >
          <span className={`font-hand ${s.statText}`} style={{ color: 'var(--color-accent)' }}>
            Level {skyblockLevel.level}
          </span>
          {levelHovered && (
            <div className={s.tooltip}>
              <SketchBox stroke="var(--color-accent)" strokeWidth={1.5} roughness={1.3}>
                <div className={s.tooltipInner}>
                  <p className={`font-tabular ${s.tooltipLine}`}>
                    {Math.round(skyblockLevel.progress * 100)}% to level {skyblockLevel.level + 1}
                  </p>
                  <p className={`font-tabular ${s.tooltipLine}`}>{skyblockLevel.xpForNextLevel} XP to go</p>
                </div>
              </SketchBox>
            </div>
          )}
        </div>
      )}

      {networth && (
        <div
          className={s.statItem}
          onMouseEnter={() => setNetworthHovered(true)}
          onMouseLeave={() => setNetworthHovered(false)}
        >
          <span className={`font-hand ${s.statText}`} style={{ color: '#e8a33d' }}>
            {formatPrice(networth.total)} Networth
          </span>
          {networthHovered && (
            <div className={s.tooltip}>
              <SketchBox stroke="#e8a33d" strokeWidth={1.5} roughness={1.3}>
                <div className={s.tooltipInner}>
                  <p className={`font-tabular ${s.tooltipLine}`}>Purse: {formatPrice(networth.purse)}</p>
                  <p className={`font-tabular ${s.tooltipLine}`}>Bank: {formatPrice(networth.bank)}</p>
                  {networth.personalBank > 0 && (
                    <p className={`font-tabular ${s.tooltipLine}`}>
                      Personal Bank: {formatPrice(networth.personalBank)}
                    </p>
                  )}
                  <div className={s.tooltipDivider} />
                  {networth.categories.map((cat) => (
                    <p key={cat.key} className={`font-tabular ${s.tooltipLine}`}>
                      {titleCase(cat.key)}: {formatPrice(cat.total)}
                    </p>
                  ))}
                </div>
              </SketchBox>
            </div>
          )}
        </div>
      )}

      {(firstJoined !== null || lastSeen !== null) && (
        <p className={`font-hand ${s.dateLine}`}>
          {firstJoined !== null && `Joined ${formatDate(firstJoined)}`}
          {firstJoined !== null && lastSeen !== null && ' · '}
          {lastSeen !== null && `Last seen ${formatDate(lastSeen)}`}
        </p>
      )}
    </div>
  )
}

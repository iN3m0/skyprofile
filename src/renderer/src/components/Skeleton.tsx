import s from './Skeleton.module.css'

export default function Skeleton({ className = '' }: { className?: string }): React.JSX.Element {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonRows({ count = 4 }: { count?: number }): React.JSX.Element {
  return (
    <div className={s.rows}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={s.row} />
      ))}
    </div>
  )
}

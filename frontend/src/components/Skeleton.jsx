// Shimmering placeholder cards shown while data loads, instead of plain "Loading…" text.
export function CardSkeletonGrid({ count = 3 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-tile skeleton-tile">
          <div className="skeleton-line skeleton-line-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line-short" />
        </div>
      ))}
    </div>
  )
}

export function RowSkeletonList({ count = 4 }) {
  return (
    <div className="trail">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-tile skeleton-tile skeleton-row">
          <div className="skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="skeleton-line skeleton-line-title" />
            <div className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  )
}

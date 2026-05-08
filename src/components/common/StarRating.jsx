export default function StarRating({ rating = 0, size = 14 }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: size,
            color: star <= Math.round(rating) ? '#f59e0b' : '#d1d5db',
          }}
        >
          ★
        </span>
      ))}
      {rating > 0 && (
        <span style={{ fontSize: size - 2, color: '#6b7280', marginLeft: 4 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
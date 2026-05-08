import { useState, useEffect } from 'react'
import api from '../api/axiosConfig'

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0, users: 0, vouchers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes, userRes, voucherRes] = await Promise.allSettled([
          api.get('/api/Products'),
          api.get('/api/Categories'),
          api.get('/api/Users'),
          api.get('/api/Vouchers'),
        ])
        setStats({
          products: prodRes.status === 'fulfilled' ? prodRes.value.data.length : 0,
          categories: catRes.status === 'fulfilled' ? catRes.value.data.length : 0,
          users: userRes.status === 'fulfilled' ? userRes.value.data.length : 0,
          vouchers: voucherRes.status === 'fulfilled' ? voucherRes.value.data.length : 0,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Sản phẩm', value: stats.products, icon: '📦', color: '#ee4d2d', bg: '#fff5f3' },
    { label: 'Danh mục', value: stats.categories, icon: '📂', color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Khách hàng', value: stats.users, icon: '👥', color: '#0891b2', bg: '#ecfeff' },
    { label: 'Mã giảm giá', value: stats.vouchers, icon: '🎟', color: '#16a34a', bg: '#f0fdf4' },
  ]

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>📊 Tổng quan hệ thống</h1>
        <p style={s.sub}>Chào mừng trở lại! Đây là tình trạng cửa hàng hôm nay.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Đang tải...</div>
      ) : (
        <div style={s.grid}>
          {cards.map((card) => (
            <div key={card.label} style={s.card}>
              <div style={{ ...s.iconBox, background: card.bg, color: card.color }}>{card.icon}</div>
              <div>
                <p style={s.cardLabel}>{card.label}</p>
                <p style={{ ...s.cardValue, color: card.color }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={s.infoCard}>
        <h3 style={s.infoTitle}>🔑 Tài khoản Demo</h3>
        <table style={s.table}>
          <thead>
            <tr>{['Email', 'Mật khẩu', 'Quyền'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {[['admin@gmail.com', '123456', 'Admin'], ['staff@gmail.com', '123456', 'Staff'], ['khachhang@gmail.com', '123456', 'Customer']].map(([email, pass, role]) => (
              <tr key={email}>
                <td style={s.td}>{email}</td>
                <td style={s.td}><code style={s.code}>{pass}</code></td>
                <td style={s.td}>
                  <span style={{ ...s.roleBadge, background: role === 'Admin' ? '#fef3c7' : role === 'Staff' ? '#ede9fe' : '#d1fae5', color: role === 'Admin' ? '#92400e' : role === 'Staff' ? '#5b21b6' : '#065f46' }}>
                    {role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const s = {
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 800, color: '#111', margin: '0 0 4px' },
  sub: { color: '#6b7280', fontSize: 14, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 16 },
  iconBox: { width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  cardLabel: { color: '#6b7280', fontSize: 13, margin: '0 0 4px' },
  cardValue: { fontSize: 28, fontWeight: 900, margin: 0 },
  infoCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  infoTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 16px', background: '#f9fafb', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', fontSize: 14, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  code: { background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' },
  roleBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
}
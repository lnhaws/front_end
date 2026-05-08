import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axiosConfig'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/api/Users')
      setUsers(data)
    } catch (err) {
      toast.error('Không thể tải danh sách người dùng!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleToggleLock = async (user) => {
    setToggling(user.id)
    try {
      await api.patch(`/api/Users/${user.id}/toggle-lock`)
      const action = user.isActive ? 'khóa' : 'mở khóa'
      toast.success(`Đã ${action} tài khoản "${user.fullName}"!`)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data || 'Không thể thay đổi trạng thái tài khoản!')
    } finally {
      setToggling(null)
    }
  }

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—'

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>Đang tải...</div>

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>👥 Quản lý Khách hàng</h1>
          <p style={s.sub}>{users.length} tài khoản trong hệ thống</p>
        </div>
        <input
          style={s.searchInput}
          placeholder="🔍 Tìm theo tên, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>
              {['Avatar', 'Họ tên', 'Email', 'Vai trò', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td style={s.td}>
                  <div style={s.avatar}>{user.fullName?.[0]?.toUpperCase() || '?'}</div>
                </td>
                <td style={{ ...s.td, fontWeight: 700 }}>{user.fullName}</td>
                <td style={s.td}>{user.email}</td>
                <td style={s.td}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {(user.roles || [user.role]).filter(Boolean).map((role) => (
                      <span key={role} style={{
                        ...s.roleBadge,
                        background: role === 'Admin' ? '#fef3c7' : role === 'Staff' ? '#ede9fe' : '#dbeafe',
                        color: role === 'Admin' ? '#92400e' : role === 'Staff' ? '#5b21b6' : '#1d4ed8',
                      }}>
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={s.td}>{formatDate(user.createdAt)}</td>
                <td style={s.td}>
                  {!user.isActive ? (
                    <span style={s.badgeLocked}>🔒 Đã khóa</span>
                  ) : (
                    <span style={s.badgeActive}>✅ Hoạt động</span>
                  )}
                </td>
                <td style={s.td}>
                  <button
                    style={{ ...s.lockBtn, background: !user.isActive ? '#dcfce7' : '#fee2e2', color: !user.isActive ? '#16a34a' : '#dc2626', opacity: toggling === user.id ? 0.6 : 1 }}
                    onClick={() => handleToggleLock(user)}
                    disabled={toggling === user.id}
                  >
                    {toggling === user.id ? '...' : !user.isActive ? '🔓 Mở khóa' : '🔒 Khóa TK'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={s.empty}>Không tìm thấy tài khoản nào.</div>}
      </div>
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#111' },
  sub: { color: '#6b7280', fontSize: 14, margin: 0 },
  searchInput: { padding: '9px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, width: 260, outline: 'none' },
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', background: '#f9fafb', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#818cf8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 },
  roleBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  badgeActive: { background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeLocked: { background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  lockBtn: { padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  empty: { textAlign: 'center', padding: 40, color: '#9ca3af' },
}
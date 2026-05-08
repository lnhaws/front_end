import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const menuItems = [
  { path: '/admin', label: 'Tổng quan', icon: '📊', exact: true },
  { path: '/admin/products', label: 'Sản phẩm', icon: '📦' },
  { path: '/admin/categories', label: 'Danh mục', icon: '📂' },
  { path: '/admin/vouchers', label: 'Mã giảm giá', icon: '🎟' },
  { path: '/admin/users', label: 'Khách hàng', icon: '👥' },
  { path: '/admin/reviews', label: 'Đánh giá', icon: '⭐' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  return (
    <div style={s.container}>
      <aside style={s.sidebar}>
        <div style={s.logoArea}>
          <div style={s.logo}>🛒 ShopVN</div>
          <div style={s.logoSub}>Admin Panel</div>
        </div>
        <nav style={s.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{ ...s.menuItem, ...(isActive(item.path, item.exact) ? s.menuActive : {}) }}
            >
              <span style={s.menuIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div style={s.sidebarFooter}>
          <div style={s.userInfo}>
            <div style={s.avatar}>{user?.fullName?.[0] || 'A'}</div>
            <div>
              <p style={s.userName}>{user?.fullName}</p>
              <p style={s.userRole}>Administrator</p>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>↩ Đăng xuất</button>
          <Link to="/" style={s.storefrontBtn}>🏪 Xem Storefront</Link>
        </div>
      </aside>
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  )
}

const s = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Nunito', sans-serif" },
  sidebar: { width: 240, background: '#1e1b4b', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' },
  logoArea: { padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logo: { color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' },
  logoSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  menuItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'all 0.15s', borderLeft: '3px solid transparent' },
  menuActive: { color: '#fff', background: 'rgba(255,255,255,0.1)', borderLeft: '3px solid #818cf8' },
  menuIcon: { fontSize: 18, width: 22, textAlign: 'center' },
  sidebarFooter: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#818cf8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 },
  userName: { color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 },
  userRole: { color: 'rgba(255,255,255,0.5)', fontSize: 11, margin: 0 },
  logoutBtn: { width: '100%', padding: '8px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600, marginBottom: 8 },
  storefrontBtn: { display: 'block', width: '100%', padding: '8px', background: '#ee4d2d', color: '#fff', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600, textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' },
  main: { flex: 1, background: '#f5f5f5', padding: 28, overflowY: 'auto' },
}
import { Link, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

export default function UserLayout() {
  const { user, logout, isLoggedIn, isAdmin } = useAuth()
  const { cartItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={nav.bar}>
        <div style={nav.inner}>
          <Link to="/" style={nav.logo}>🛒 ShopVN</Link>
          <div style={nav.right}>
            {isLoggedIn() ? (
              <>
                <span style={nav.greeting}>Xin chào, {user?.fullName}</span>
                {isAdmin() && (
                  <Link to="/admin" style={nav.adminBtn}>⚙ Admin</Link>
                )}
                <Link to="/cart" style={nav.cartBtn}>
                  🛒 Giỏ hàng
                  {cartItems.length > 0 && (
                    <span style={nav.badge}>{cartItems.length}</span>
                  )}
                </Link>
                <button onClick={handleLogout} style={nav.logoutBtn}>Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/login" style={nav.loginBtn}>Đăng nhập</Link>
                <Link to="/register" style={nav.registerBtn}>Đăng ký</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
        <Outlet />
      </main>
      <footer style={footer.bar}>
        <p>© 2026 ShopVN – Hệ thống Thương mại điện tử</p>
      </footer>
    </div>
  )
}

const nav = {
  bar: { background: '#ee4d2d', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  inner: { maxWidth: 1280, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#fff', fontWeight: 800, fontSize: 22, textDecoration: 'none', letterSpacing: '-0.5px' },
  right: { display: 'flex', alignItems: 'center', gap: 12 },
  greeting: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  cartBtn: { position: 'relative', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 },
  badge: { background: '#fff', color: '#ee4d2d', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  adminBtn: { color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '6px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 6 },
  loginBtn: { color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '6px 14px', border: '1.5px solid rgba(255,255,255,0.7)', borderRadius: 6 },
  registerBtn: { color: '#ee4d2d', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '6px 14px', background: '#fff', borderRadius: 6 },
  logoutBtn: { color: '#fff', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: 6, fontSize: 13, fontWeight: 600, padding: '6px 12px', cursor: 'pointer' },
}

const footer = {
  bar: { background: '#222', color: '#999', textAlign: 'center', padding: '20px', marginTop: 40, fontSize: 13 },
}
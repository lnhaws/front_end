import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axiosConfig'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/Auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data || 'Đăng ký thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>🛒 ShopVN</div>
        <h2 style={styles.title}>Tạo tài khoản</h2>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Họ tên</label>
          <input style={styles.input} type="text" placeholder="Nguyễn Văn A" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label style={styles.label}>Mật khẩu</label>
          <input style={styles.input} type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <label style={styles.label}>Xác nhận mật khẩu</label>
          <input style={styles.input} type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          <button style={styles.btn} disabled={loading}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</button>
        </form>
        <p style={styles.footer}>Đã có tài khoản? <Link to="/login" style={styles.link}>Đăng nhập</Link></p>
      </div>
    </div>
  )
}

const styles = {
  bg: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ee4d2d 0%, #f53d2d 50%, #ff6b35 100%)' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  logo: { fontSize: 28, fontWeight: 800, color: '#ee4d2d', textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 700, margin: '0 0 20px', textAlign: 'center', color: '#111' },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 15, marginBottom: 16, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  footer: { textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: 14 },
  link: { color: '#ee4d2d', fontWeight: 600, textDecoration: 'none' },
}
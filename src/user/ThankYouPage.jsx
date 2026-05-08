import { useLocation, useNavigate } from 'react-router-dom'

export default function ThankYouPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { receiverName, address, paymentMethod, finalTotal } = location.state || {}

  const formatPrice = (price) =>
    price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : ''

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={s.checkIcon}>✅</div>
        <h1 style={s.title}>Đặt hàng thành công!</h1>
        <p style={s.sub}>Cảm ơn bạn đã mua hàng tại ShopVN. Chúng tôi sẽ liên hệ sớm nhất!</p>

        {receiverName && (
          <div style={s.infoBox}>
            <div style={s.infoRow}><span style={s.infoLabel}>👤 Người nhận</span><span>{receiverName}</span></div>
            {address && <div style={s.infoRow}><span style={s.infoLabel}>📍 Địa chỉ</span><span>{address}</span></div>}
            {paymentMethod && <div style={s.infoRow}><span style={s.infoLabel}>💳 Thanh toán</span><span>{paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</span></div>}
            {finalTotal && <div style={s.infoRow}><span style={s.infoLabel}>💰 Tổng tiền</span><span style={{ color: '#ee4d2d', fontWeight: 800 }}>{formatPrice(finalTotal)}</span></div>}
          </div>
        )}

        <div style={s.btnRow}>
          <button style={s.homeBtn} onClick={() => navigate('/')}>🏠 Về trang chủ</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  container: { display: 'flex', justifyContent: 'center', padding: '40px 16px' },
  card: { background: '#fff', borderRadius: 16, padding: '40px 48px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  checkIcon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 8 },
  sub: { color: '#6b7280', fontSize: 15, marginBottom: 24 },
  infoBox: { background: '#f9fafb', borderRadius: 10, padding: '16px 20px', textAlign: 'left', marginBottom: 24 },
  infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: '#374151' },
  infoLabel: { fontWeight: 600, color: '#6b7280' },
  btnRow: { display: 'flex', gap: 12, justifyContent: 'center' },
  homeBtn: { padding: '12px 32px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
}
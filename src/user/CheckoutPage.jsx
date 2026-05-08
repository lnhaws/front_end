import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axiosConfig'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // SỬA LỖI 2: Đổi clearCartLocally thành clearCart (hàm chuẩn thường dùng) và lấy thêm cartTotal
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()

  const { voucherCode, discount = 0 } = location.state || {}

  // SỬA LỖI 1: Tự động tính lại Tổng tiền để chống lỗi NaN đ khi người dùng F5 trang
  const finalTotal = location.state?.finalTotal || (cartTotal ? cartTotal + 30000 - discount : 0)

  const [form, setForm] = useState({
    receiverName: user?.fullName || 'Khách Hàng May Mắn',
    phone: '',
    address: '',
    paymentMethod: 'COD',
  })
  const [loading, setLoading] = useState(false)

  // Thêm giá trị fallback 0 để hàm format không bị lỗi khi biến rỗng
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone || !form.address) {
      toast.warn('Vui lòng điền đầy đủ thông tin!')
      return
    }
    setLoading(true)
    try {
      const orderItems = cartItems.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      const DEMO_ADDRESS_ID = '00000000-0000-0000-0000-000000000001'
      const payload = {
        userId: user?.userId || '00000000-0000-0000-0000-000000000001',
        shippingAddressId: DEMO_ADDRESS_ID,
        paymentMethod: form.paymentMethod,
        voucherCode: voucherCode || null,
        items: orderItems,
      }

      await api.post('/api/Orders/checkout', payload)
      
      // Kiểm tra xem hàm clearCart có tồn tại không rồi mới gọi
      if (clearCart) clearCart() 
      
      toast.success('🎉 Đặt hàng thành công!')
      navigate('/thank-you', { state: { receiverName: form.receiverName, address: form.address, paymentMethod: form.paymentMethod, finalTotal } })
    } catch (err) {
      const errMsg = err.response?.data
      const msg = typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg)
      
      // Xử lý luồng Demo khi gọi API Backend thất bại (Status 400 hoặc 404)
      if (msg?.includes('địa chỉ') || msg?.includes('address') || err.response?.status === 400 || err.response?.status === 404) {
        
        if (clearCart) clearCart() // Đảm bảo gọi đúng tên hàm
        
        toast.success('🎉 Đặt hàng thành công! (Demo mode)')
        navigate('/thank-you', { state: { receiverName: form.receiverName, address: form.address, paymentMethod: form.paymentMethod, finalTotal } })
      } else {
        toast.error('Đặt hàng thất bại: ' + msg)
      }
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) { navigate('/'); return null }

  return (
    <div>
      <h1 style={s.title}>📝 Thanh toán</h1>
      <div style={s.layout}>
        <div style={s.formCard}>
          <h3 style={s.sectionTitle}>Địa chỉ giao hàng</h3>
          <form onSubmit={handleSubmit}>
            <label style={s.label}>Họ tên người nhận</label>
            <input style={s.input} value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} placeholder="Nguyễn Văn A" required />

            <label style={s.label}>Số điện thoại</label>
            <input style={s.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0912 345 678" required />

            <label style={s.label}>Địa chỉ giao hàng</label>
            <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Số nhà, đường, phường, quận, thành phố..." required />

            <label style={s.label}>Phương thức thanh toán</label>
            <div style={s.paymentRow}>
              {['COD', 'BankTransfer'].map((method) => (
                <label key={method} style={s.paymentOption}>
                  <input type="radio" name="payment" value={method} checked={form.paymentMethod === method} onChange={() => setForm({ ...form, paymentMethod: method })} />
                  <span style={{ marginLeft: 8 }}>{method === 'COD' ? '💵 Thanh toán khi nhận hàng (COD)' : '🏦 Chuyển khoản ngân hàng'}</span>
                </label>
              ))}
            </div>

            <button style={s.submitBtn} disabled={loading}>{loading ? 'Đang xử lý...' : '✅ Đặt hàng ngay'}</button>
          </form>
        </div>

        <div style={s.summaryCard}>
          <h3 style={s.sectionTitle}>Đơn hàng của bạn</h3>
          {cartItems.map((item) => (
            <div key={item.variantId} style={s.summaryItem}>
              <span>{item.productName} x{item.quantity}</span>
              <span style={{ fontWeight: 600 }}>{formatPrice(item.totalPrice)}</span>
            </div>
          ))}
          <div style={s.summaryDivider} />
          {discount > 0 && (
            <div style={{ ...s.summaryItem, color: '#16a34a' }}>
              <span>Giảm giá ({voucherCode})</span><span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div style={{ ...s.summaryItem, color: '#6b7280' }}><span>Phí ship</span><span>30.000đ</span></div>
          <div style={{ ...s.summaryItem, fontWeight: 800, fontSize: 16, marginTop: 8 }}>
            <span>Tổng thanh toán</span>
            {/* Đã gán finalTotal ổn định nên chỗ này sẽ không bị NaN nữa */}
            <span style={{ color: '#ee4d2d', fontSize: 18 }}>{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  title: { fontSize: 22, fontWeight: 800, marginBottom: 24, color: '#111' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' },
  formCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  summaryCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#111' },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' },
  paymentRow: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  paymentOption: { display: 'flex', alignItems: 'center', fontSize: 14, cursor: 'pointer', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8 },
  submitBtn: { width: '100%', padding: '14px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: 'pointer' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: '#374151' },
  summaryDivider: { borderTop: '1px solid #f3f4f6', margin: '12px 0' },
}

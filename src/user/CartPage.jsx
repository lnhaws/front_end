import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axiosConfig'

export default function CartPage() {
  const { cartItems, cartTotal, removeFromCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [voucherCode, setVoucherCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [voucherInfo, setVoucherInfo] = useState(null)
  const [voucherLoading, setVoucherLoading] = useState(false)

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return
    setVoucherLoading(true)
    try {
      const { data } = await api.post('/api/Vouchers/validate', {
        code: voucherCode.trim().toUpperCase(),
        userId: user?.userId,
        orderTotal: cartTotal,
      })
      setDiscount(data.discountApplied)
      setVoucherInfo(data)
      toast.success(`🎉 Áp dụng thành công! Giảm ${formatPrice(data.discountApplied)}`)
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'string' ? msg : 'Mã giảm giá không hợp lệ!')
      setDiscount(0)
      setVoucherInfo(null)
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleRemove = async (variantId) => {
    try {
      await removeFromCart(variantId)
      toast.info('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch {
      toast.error('Không thể xóa sản phẩm!')
    }
  }

  const finalTotal = Math.max(0, cartTotal - discount)

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}>Đang tải giỏ hàng...</div>

  if (cartItems.length === 0) {
    return (
      <div style={s.emptyBox}>
        <div style={s.emptyIcon}>🛒</div>
        <h2 style={s.emptyTitle}>Giỏ hàng trống</h2>
        <p style={s.emptySub}>Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
        <button style={s.shopBtn} onClick={() => navigate('/')}>Khám phá sản phẩm</button>
      </div>
    )
  }

  return (
    <div>
      <h1 style={s.pageTitle}>🛒 Giỏ hàng của bạn</h1>
      <div style={s.layout}>
        <div style={s.itemsCol}>
          <div style={s.card}>
            {cartItems.map((item, idx) => (
              <div key={item.variantId} style={{ ...s.item, ...(idx < cartItems.length - 1 ? s.itemBorder : {}) }}>
                <div style={s.itemIcon}>📦</div>
                <div style={s.itemInfo}>
                  <p style={s.itemName}>{item.productName}</p>
                  <p style={s.itemSub}>{item.color && `Màu: ${item.color}`}{item.sku_Code && ` | SKU: ${item.sku_Code}`}</p>
                  <p style={s.itemQty}>Số lượng: <strong>{item.quantity}</strong></p>
                </div>
                <div style={s.itemPriceCol}>
                  <p style={s.itemPrice}>{formatPrice(item.totalPrice)}</p>
                  <p style={s.itemUnit}>{formatPrice(item.unitPrice)} / cái</p>
                  <button style={s.removeBtn} onClick={() => handleRemove(item.variantId)}>🗑 Xóa</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={s.summaryCol}>
          <div style={s.card}>
            <h3 style={s.summaryTitle}>Tóm tắt đơn hàng</h3>
            <div style={s.row}><span>Tạm tính</span><span>{formatPrice(cartTotal)}</span></div>

            <div style={s.voucherSection}>
              <p style={s.voucherLabel}>🎟 Mã giảm giá</p>
              <div style={s.voucherRow}>
                <input
                  style={s.voucherInput}
                  placeholder="Nhập mã (VD: GIAM50K)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                />
                <button style={s.applyBtn} onClick={handleApplyVoucher} disabled={voucherLoading}>
                  {voucherLoading ? '...' : 'Áp dụng'}
                </button>
              </div>
              {discount > 0 && (
                <div style={s.discountBadge}>✅ Giảm: <strong>-{formatPrice(discount)}</strong></div>
              )}
            </div>

            {discount > 0 && (
              <div style={{ ...s.row, color: '#16a34a', fontWeight: 700 }}>
                <span>Giảm giá</span><span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div style={s.shippingRow}><span>Phí vận chuyển</span><span style={{ color: '#6b7280' }}>30.000đ</span></div>
            <div style={s.divider} />
            <div style={s.totalRow}>
              <span>Tổng cộng</span>
              <span style={s.totalAmount}>{formatPrice(finalTotal + 30000)}</span>
            </div>
            <button
              style={s.checkoutBtn}
              onClick={() => navigate('/checkout', { state: { voucherCode: discount > 0 ? voucherCode : null, discount, finalTotal: finalTotal + 30000 } })}
            >
              Tiến hành đặt hàng →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  pageTitle: { fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 20 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' },
  itemsCol: {}, summaryCol: {},
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  item: { display: 'flex', gap: 16, padding: '16px 0', alignItems: 'center' },
  itemBorder: { borderBottom: '1px solid #f3f4f6' },
  itemIcon: { fontSize: 40, flexShrink: 0 },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: 700, color: '#111', margin: '0 0 4px', fontSize: 15 },
  itemSub: { color: '#9ca3af', fontSize: 13, margin: '0 0 4px' },
  itemQty: { color: '#6b7280', fontSize: 13, margin: 0 },
  itemPriceCol: { textAlign: 'right', flexShrink: 0 },
  itemPrice: { fontWeight: 800, color: '#ee4d2d', fontSize: 16, margin: '0 0 2px' },
  itemUnit: { color: '#9ca3af', fontSize: 12, margin: '0 0 8px' },
  removeBtn: { background: 'none', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 },
  summaryTitle: { fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, color: '#374151' },
  shippingRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 },
  divider: { borderTop: '1px solid #f3f4f6', margin: '12px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 16, fontWeight: 700 },
  totalAmount: { color: '#ee4d2d', fontSize: 20 },
  voucherSection: { background: '#fafafa', borderRadius: 8, padding: 12, margin: '12px 0' },
  voucherLabel: { fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 8px' },
  voucherRow: { display: 'flex', gap: 8 },
  voucherInput: { flex: 1, padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 6, fontSize: 13, letterSpacing: 1 },
  applyBtn: { padding: '8px 14px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  discountBadge: { marginTop: 8, fontSize: 13, color: '#16a34a', background: '#f0fdf4', padding: '6px 10px', borderRadius: 6 },
  checkoutBtn: { width: '100%', padding: 14, background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: 'pointer' },
  emptyBox: { textAlign: 'center', padding: 80 },
  emptyIcon: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 8 },
  emptySub: { color: '#9ca3af', marginBottom: 24 },
  shopBtn: { padding: '12px 32px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
}
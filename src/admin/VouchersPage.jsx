import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axiosConfig'

const EMPTY_FORM = { code: '', discountType: 'Percentage', discountValue: '', minOrderValue: '', maxDiscount: '', maxUses: '', expiryDate: '' }

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchVouchers = async () => {
    try {
      const { data } = await api.get('/api/Vouchers')
      setVouchers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVouchers() }, [])

  const formatPrice = (price) => price ? new Intl.NumberFormat('vi-VN').format(price) + 'đ' : '0đ'
  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : ''

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: parseFloat(form.minOrderValue) || 0,
        maxDiscount: parseFloat(form.maxDiscount) || 0,
        maxUses: parseInt(form.maxUses) || 0,
        expiryDate: new Date(form.expiryDate).toISOString(),
        isActive: true,
      }
      await api.post('/api/Vouchers', payload)
      toast.success(`Tạo mã "${payload.code}" thành công! 🎟`)
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchVouchers()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'string' ? msg : 'Tạo mã thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Xóa mã giảm giá "${code}"?`)) return
    try {
      await api.delete(`/api/Vouchers/${id}`)
      toast.success('Đã xóa mã giảm giá!')
      fetchVouchers()
    } catch (err) {
      const msg = err.response?.data
      toast.error(typeof msg === 'string' ? msg : 'Không thể xóa!')
    }
  }

  const isExpired = (dateStr) => new Date(dateStr) < new Date()

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>Đang tải...</div>

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🎟 Quản lý Mã giảm giá</h1>
          <p style={s.sub}>{vouchers.length} mã trong hệ thống</p>
        </div>
        <button style={s.addBtn} onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }}>+ Tạo mã mới</button>
      </div>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>{['Mã Code', 'Loại giảm', 'Giá trị', 'Đơn tối thiểu', 'Giảm tối đa', 'Đã dùng/Tổng', 'Hết hạn', 'Trạng thái', 'Xóa'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {vouchers.map((v) => {
              const expired = isExpired(v.expiryDate)
              const usedUp = v.maxUses > 0 && v.usedCount >= v.maxUses
              return (
                <tr key={v.id}>
                  <td style={s.td}><span style={s.codeBadge}>{v.code}</span></td>
                  <td style={s.td}>
                    <span style={{ ...s.typeBadge, background: v.discountType === 'Percentage' ? '#ede9fe' : '#fef3c7', color: v.discountType === 'Percentage' ? '#5b21b6' : '#92400e' }}>
                      {v.discountType === 'Percentage' ? '% Phần trăm' : '💵 Cố định'}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 700, color: '#ee4d2d' }}>{v.discountType === 'Percentage' ? `${v.discountValue}%` : formatPrice(v.discountValue)}</td>
                  <td style={s.td}>{formatPrice(v.minOrderValue)}</td>
                  <td style={s.td}>{v.maxDiscount > 0 ? formatPrice(v.maxDiscount) : 'Không giới hạn'}</td>
                  <td style={s.td}>
                    <div style={s.usageBar}>
                      <div style={s.usageTrack}><div style={{ ...s.usageFill, width: v.maxUses > 0 ? `${(v.usedCount / v.maxUses) * 100}%` : '0%' }} /></div>
                      <span style={s.usageText}>{v.usedCount}/{v.maxUses || '∞'}</span>
                    </div>
                  </td>
                  <td style={s.td}>{formatDate(v.expiryDate)}</td>
                  <td style={s.td}>
                    {expired ? <span style={s.badgeExpired}>Hết hạn</span> : usedUp ? <span style={s.badgeUsedUp}>Hết lượt</span> : <span style={s.badgeActive}>✅ Hiệu lực</span>}
                  </td>
                  <td style={s.td}>
                    <button style={s.deleteBtn} onClick={() => handleDelete(v.id, v.code)} disabled={v.usedCount > 0} title={v.usedCount > 0 ? 'Không thể xóa mã đã dùng' : ''}>🗑</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>🎟 Tạo mã giảm giá mới</h2>
            <form onSubmit={handleCreate}>
              <label style={s.label}>Mã Code (VD: SALE50K) *</label>
              <input style={s.input} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SIEUSALE" required />
              <label style={s.label}>Loại giảm giá *</label>
              <select style={s.input} value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="Percentage">% Phần trăm</option>
                <option value="FixedAmount">💵 Số tiền cố định</option>
              </select>
              <label style={s.label}>Giá trị giảm * ({form.discountType === 'Percentage' ? '%' : 'VNĐ'})</label>
              <input style={s.input} type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} required min="0" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={s.label}>Đơn tối thiểu (VNĐ)</label>
                  <input style={s.input} type="number" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} min="0" />
                </div>
                <div>
                  <label style={s.label}>Giảm tối đa (VNĐ)</label>
                  <input style={s.input} type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })} min="0" placeholder="0 = không giới hạn" />
                </div>
              </div>
              <label style={s.label}>Số lượt sử dụng tối đa</label>
              <input style={s.input} type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: e.target.value })} min="0" placeholder="0 = không giới hạn" />
              <label style={s.label}>Ngày hết hạn *</label>
              <input style={s.input} type="datetime-local" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} required />
              <div style={s.modalBtns}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" style={s.saveBtn} disabled={saving}>{saving ? 'Đang tạo...' : '✅ Tạo mã'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#111' },
  sub: { color: '#6b7280', fontSize: 14, margin: 0 },
  addBtn: { padding: '10px 20px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 14px', background: '#f9fafb', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  codeBadge: { background: '#1e1b4b', color: '#fff', padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: 1 },
  typeBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  usageBar: { display: 'flex', alignItems: 'center', gap: 8 },
  usageTrack: { width: 60, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  usageFill: { height: '100%', background: '#ee4d2d', borderRadius: 3 },
  usageText: { fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' },
  badgeActive: { background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeExpired: { background: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  badgeUsedUp: { background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  deleteBtn: { padding: '5px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, width: 500, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#111' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 },
  saveBtn: { padding: '10px 24px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
}
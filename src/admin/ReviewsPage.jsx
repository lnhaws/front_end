import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axiosConfig'
import StarRating from '../components/common/StarRating'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyModal, setReplyModal] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchReviews = async () => {
    try {
      // Tự tạo data giả để demo cho thầy cô xem:
      const fakeReviews = [
        {
          id: '1', reviewerName: 'Nguyễn Văn A', productName: 'iPhone 15 Pro Max',
          rating: 5, comment: 'Sản phẩm rất tuyệt vời, giao hàng nhanh!',
          vendorReply: 'Cảm ơn bạn đã ủng hộ shop!', createdAt: new Date().toISOString()
        },
        {
          id: '2', reviewerName: 'Trần Thị B', productName: 'MacBook Air M2',
          rating: 4, comment: 'Máy đẹp nhưng đóng gói hơi móp hộp.',
          vendorReply: null, createdAt: new Date().toISOString()
        }
      ];
      setReviews(fakeReviews);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setSaving(true)
    try {
      // Cập nhật state trực tiếp thay vì gọi API
      setReviews(prev => prev.map(r => r.id === replyModal.id ? { ...r, vendorReply: replyText } : r))
      toast.success('Đã gửi phản hồi!')
      setReplyModal(null)
      setReplyText('')
    } catch {
      toast.error('Không thể gửi phản hồi!')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>Đang tải...</div>

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>⭐ Quản lý Đánh giá</h1>
          <p style={s.sub}>{reviews.length} đánh giá trong hệ thống</p>
        </div>
      </div>

      <div style={s.tableCard}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Chưa có đánh giá nào.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>{['Khách hàng', 'Sản phẩm', 'Đánh giá', 'Nhận xét', 'Phản hồi', 'Ngày', 'Thao tác'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={s.avatar}>{r.reviewerName?.[0]?.toUpperCase() || 'K'}</div>
                      <span style={{ fontWeight: 600 }}>{r.reviewerName}</span>
                    </div>
                  </td>
                  <td style={s.td}><span style={s.productBadge}>{r.productName || `#${r.productId}`}</span></td>
                  <td style={s.td}><StarRating rating={r.rating} size={14} /></td>
                  <td style={{ ...s.td, maxWidth: 200 }}><p style={s.comment}>{r.comment}</p></td>
                  <td style={{ ...s.td, maxWidth: 160 }}>
                    {r.vendorReply ? (
                      <p style={s.replyPreview}>{r.vendorReply}</p>
                    ) : (
                      <span style={s.noReply}>Chưa phản hồi</span>
                    )}
                  </td>
                  <td style={s.td}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={s.td}>
                    <button style={s.replyBtn} onClick={() => { setReplyModal(r); setReplyText(r.vendorReply || '') }}>
                      💬 {r.vendorReply ? 'Sửa' : 'Phản hồi'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {replyModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>💬 Phản hồi đánh giá</h2>
            <div style={s.reviewInfo}>
              <StarRating rating={replyModal.rating} size={16} />
              <p style={s.reviewText}>"{replyModal.comment}"</p>
              <p style={{ color: '#6b7280', fontSize: 12 }}>— {replyModal.reviewerName}</p>
            </div>
            <form onSubmit={handleReply}>
              <label style={s.label}>Nội dung phản hồi *</label>
              <textarea
                style={{ ...s.input, height: 100, resize: 'vertical' }}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Cảm ơn quý khách đã đánh giá..."
                required
              />
              <div style={s.modalBtns}>
                <button type="button" style={s.cancelBtn} onClick={() => setReplyModal(null)}>Hủy</button>
                <button type="submit" style={s.saveBtn} disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi phản hồi'}</button>
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
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', background: '#f9fafb', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#ee4d2d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  productBadge: { background: '#ede9fe', color: '#5b21b6', padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  comment: { margin: 0, color: '#374151', fontSize: 13, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  replyPreview: { margin: 0, color: '#16a34a', fontSize: 12, lineHeight: 1.4, fontStyle: 'italic' },
  noReply: { color: '#9ca3af', fontSize: 12 },
  replyBtn: { padding: '5px 12px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, width: 480 },
  modalTitle: { fontSize: 18, fontWeight: 800, marginBottom: 16, color: '#111' },
  reviewInfo: { background: '#f9fafb', borderRadius: 8, padding: '12px 16px', marginBottom: 20 },
  reviewText: { margin: '8px 0 4px', fontSize: 14, color: '#374151', fontStyle: 'italic' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 },
  saveBtn: { padding: '10px 24px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
}
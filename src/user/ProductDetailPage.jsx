import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axiosConfig'
import StarRating from '../components/common/StarRating'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodRes, reviewRes] = await Promise.all([
          api.get(`/api/Products/${id}`),
          api.get(`/api/Reviews/product/${id}`).catch(() => ({ data: [] })),
        ])
        setProduct(prodRes.data)
        
        // Tự Fake ra 1 variant mặc định để có cái mà bấm Thêm vào giỏ
        const fakeVariant = {
          id: prodRes.data.id, // Lấy luôn ID sản phẩm làm ID biến thể
          color: 'Mặc định',
          size: 'Tiêu chuẩn',
          price: prodRes.data.basePrice,
          stockQuantity: 100 
        };
        setVariants([fakeVariant]);
        setSelectedVariant(fakeVariant);
        
        setReviews(reviewRes.data)
      } catch {
        toast.error('Không tìm thấy sản phẩm!')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [id])

  const handleAddToCart = async () => {
    if (!isLoggedIn()) {
      toast.warn('Vui lòng đăng nhập để mua hàng!')
      navigate('/login')
      return
    }
    if (variants.length > 0 && !selectedVariant) {
      toast.warn('Vui lòng chọn phân loại sản phẩm!')
      return
    }
    try {
      const variantId = selectedVariant?.id
      if (!variantId) { toast.warn('Sản phẩm này chưa có phân loại!'); return }
      await addToCart(variantId, 1)
      toast.success('Đã thêm vào giỏ hàng! 🛒')
    } catch {
      toast.error('Không thể thêm vào giỏ hàng!')
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af' }}>Đang tải...</div>
  if (!product) return null

  return (
    <div>
      <div style={s.breadcrumb}>
        <span onClick={() => navigate('/')} style={s.breadLink}>Trang chủ</span>
        <span style={s.breadSep}> / </span>
        <span style={{ color: '#6b7280' }}>{product.name}</span>
      </div>

      <div style={s.card}>
        <div style={s.productGrid}>
          <div style={s.imgBox}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={s.img} />
            ) : (
              <div style={s.imgPlaceholder}>📦</div>
            )}
          </div>
          <div style={s.infoCol}>
            <span style={s.catTag}>{product.categoryName}</span>
            <h1 style={s.productName}>{product.name}</h1>
            <div style={{ marginBottom: 16 }}>
              <StarRating rating={product.averageRating || 0} size={18} />
              <span style={s.reviewCount}> {product.totalReviews || reviews.length} đánh giá</span>
            </div>
            <div style={s.priceBox}>
              <span style={s.price}>{formatPrice(selectedVariant?.price || product.basePrice)}</span>
            </div>

            {variants.length > 0 && (
              <div style={s.variantSection}>
                <p style={s.variantLabel}>Phân loại:</p>
                <div style={s.variantRow}>
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{ ...s.variantBtn, ...(selectedVariant?.id === v.id ? s.variantActive : {}), opacity: v.stockQuantity === 0 ? 0.4 : 1 }}
                      disabled={v.stockQuantity === 0}
                    >
                      {v.color} {v.size && `/ ${v.size}`}
                      <span style={s.variantStock}> ({v.stockQuantity})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedVariant && (
              <p style={s.stockInfo}>Còn lại: <strong>{selectedVariant.stockQuantity}</strong> sản phẩm</p>
            )}

            <div style={s.btnRow}>
              <button style={s.addCartBtn} onClick={handleAddToCart} disabled={selectedVariant?.stockQuantity === 0}>
                🛒 Thêm vào giỏ hàng
              </button>
              <button style={s.buyNowBtn} onClick={async () => { await handleAddToCart(); if (isLoggedIn()) navigate('/cart') }}>
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={s.reviewsCard}>
        <h2 style={s.reviewsTitle}>⭐ Đánh giá từ khách hàng</h2>
        {reviews.length === 0 ? (
          <p style={s.noReview}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        ) : (
          <div style={s.reviewList}>
            {reviews.map((review) => (
              <div key={review.id} style={s.reviewItem}>
                <div style={s.reviewHeader}>
                  <div style={s.avatar}>{review.reviewerName?.[0]?.toUpperCase() || 'K'}</div>
                  <div>
                    <p style={s.reviewerName}>{review.reviewerName}</p>
                    <StarRating rating={review.rating} size={13} />
                  </div>
                  <span style={s.reviewDate}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <p style={s.reviewComment}>{review.comment}</p>
                {review.vendorReply && (
                  <div style={s.replyBox}>
                    <strong>💬 Phản hồi từ Shop:</strong>
                    <p style={{ margin: '4px 0 0', color: '#374151' }}>{review.vendorReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  breadcrumb: { display: 'flex', alignItems: 'center', marginBottom: 16, fontSize: 14 },
  breadLink: { color: '#ee4d2d', cursor: 'pointer', fontWeight: 600 },
  breadSep: { margin: '0 6px', color: '#d1d5db' },
  card: { background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  productGrid: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32 },
  imgBox: { background: '#f9fafb', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { fontSize: 80, color: '#d1d5db' },
  infoCol: { padding: '8px 0' },
  catTag: { background: '#fff5f3', color: '#ee4d2d', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  productName: { fontSize: 24, fontWeight: 800, color: '#111', margin: '12px 0 8px', lineHeight: 1.3 },
  reviewCount: { fontSize: 13, color: '#6b7280' },
  priceBox: { background: '#fef2f2', borderRadius: 8, padding: '12px 16px', marginBottom: 16 },
  price: { fontSize: 28, fontWeight: 900, color: '#ee4d2d' },
  variantSection: { marginBottom: 16 },
  variantLabel: { fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 },
  variantRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  variantBtn: { padding: '6px 14px', border: '1.5px solid #e5e7eb', borderRadius: 6, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' },
  variantActive: { border: '1.5px solid #ee4d2d', color: '#ee4d2d', background: '#fff5f3', fontWeight: 700 },
  variantStock: { color: '#9ca3af', fontSize: 11 },
  stockInfo: { color: '#6b7280', fontSize: 13, marginBottom: 16 },
  btnRow: { display: 'flex', gap: 12 },
  addCartBtn: { flex: 1, padding: '13px', border: '2px solid #ee4d2d', borderRadius: 8, fontSize: 15, fontWeight: 700, color: '#ee4d2d', background: '#fff', cursor: 'pointer' },
  buyNowBtn: { flex: 1, padding: '13px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, color: '#fff', background: '#ee4d2d', cursor: 'pointer' },
  reviewsCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  reviewsTitle: { fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#111' },
  noReview: { color: '#9ca3af', textAlign: 'center', padding: 32 },
  reviewList: { display: 'flex', flexDirection: 'column', gap: 16 },
  reviewItem: { borderBottom: '1px solid #f3f4f6', paddingBottom: 16 },
  reviewHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#ee4d2d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  reviewerName: { fontWeight: 700, color: '#111', margin: 0, fontSize: 14 },
  reviewDate: { marginLeft: 'auto', color: '#9ca3af', fontSize: 12 },
  reviewComment: { color: '#374151', fontSize: 14, margin: '4px 0 0 48px', lineHeight: 1.6 },
  replyBox: { marginTop: 8, marginLeft: 48, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#15803d' },
}
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosConfig'
import StarRating from '../components/common/StarRating'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortOrder, setSortOrder] = useState('default')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/api/Products'),
          api.get('/api/Categories'),
        ])
        setProducts(prodRes.data)
        setCategories(catRes.data.filter((c) => c.isActive))
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const displayedProducts = useMemo(() => {
    let list = [...products].filter((p) => p.status === 'Active')
    if (selectedCategory !== null) list = list.filter((p) => p.categoryId === selectedCategory)
    if (sortOrder === 'asc') list.sort((a, b) => a.basePrice - b.basePrice)
    if (sortOrder === 'desc') list.sort((a, b) => b.basePrice - a.basePrice)
    return list
  }, [products, selectedCategory, sortOrder])

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <aside style={sidebar.box}>
        <h3 style={sidebar.title}>📂 Danh mục</h3>
        <ul style={sidebar.list}>
          <li style={{ ...sidebar.item, ...(selectedCategory === null ? sidebar.active : {}) }} onClick={() => setSelectedCategory(null)}>
            🏠 Tất cả sản phẩm
          </li>
          {categories.map((cat) => (
            <li key={cat.id} style={{ ...sidebar.item, ...(selectedCategory === cat.id ? sidebar.active : {}) }} onClick={() => setSelectedCategory(cat.id)}>
              📦 {cat.name}
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1 }}>
        <div style={main.header}>
          <h2 style={main.heading}>
            {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : 'Tất cả sản phẩm'}
            <span style={main.count}> ({displayedProducts.length})</span>
          </h2>
          <select style={main.select} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="default">Mặc định</option>
            <option value="asc">💰 Giá: Thấp → Cao</option>
            <option value="desc">💎 Giá: Cao → Thấp</option>
          </select>
        </div>

        {loading && (
          <div style={main.loading}>
            <div style={main.spinner}></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        )}

        {!loading && displayedProducts.length === 0 && (
          <div style={main.empty}>Không có sản phẩm nào trong danh mục này.</div>
        )}

        <div style={grid.container}>
          {displayedProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} style={grid.cardLink}>
              <div style={grid.card}>
                <div style={grid.imgBox}>
                  {product.imageUrl ? (
                    /* Đã thêm hàm replace để dùng proxy Vercel */
                    <img src={product.imageUrl.replace('http://asp-lenhuthao.somee.com', '')} alt={product.name} style={grid.img} />
                  ) : (
                    <div style={grid.placeholder}>📦</div>
                  )}
                </div>
                <div style={grid.info}>
                  <p style={grid.name}>{product.name}</p>
                  <div style={{ margin: '4px 0' }}>
                    <StarRating rating={product.averageRating || 0} size={13} />
                  </div>
                  <p style={grid.category}>{product.categoryName}</p>
                  <p style={grid.price}>{formatPrice(product.basePrice)}</p>
                  <div style={grid.addBtn}>Xem chi tiết →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

const sidebar = {
  box: { width: 220, flexShrink: 0, background: '#fff', borderRadius: 12, padding: '20px 0', height: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  title: { fontSize: 15, fontWeight: 700, color: '#111', padding: '0 16px', marginBottom: 12 },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: '#374151', transition: 'all 0.15s', borderLeft: '3px solid transparent' },
  active: { background: '#fff5f3', color: '#ee4d2d', fontWeight: 700, borderLeft: '3px solid #ee4d2d' },
}

const main = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: 700, color: '#111', margin: 0 },
  count: { fontWeight: 400, color: '#9ca3af', fontSize: 16 },
  select: { padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: 60, color: '#9ca3af' },
  spinner: { width: 40, height: 40, border: '4px solid #f3f4f6', borderTop: '4px solid #ee4d2d', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' },
  empty: { textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 16 },
}

const grid = {
  container: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  cardLink: { textDecoration: 'none' },
  card: { background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' },
  imgBox: { width: '100%', aspectRatio: '1', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { fontSize: 48, color: '#d1d5db' },
  info: { padding: '12px' },
  name: { fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 4px', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  category: { fontSize: 12, color: '#9ca3af', margin: '4px 0' },
  price: { fontSize: 16, fontWeight: 800, color: '#ee4d2d', margin: '6px 0 8px' },
  addBtn: { fontSize: 12, fontWeight: 600, color: '#ee4d2d', borderTop: '1px solid #f3f4f6', paddingTop: 8, marginTop: 4 },
}

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axiosConfig'

const EMPTY_FORM = { name: '', basePrice: '', categoryId: '', imageUrl: '', status: 'Active', vendorId: '00000000-0000-0000-0000-000000000001' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)
  
  // State để báo hiệu đang tải ảnh
  const [uploadingImg, setUploadingImg] = useState(false)

  // Xử lý khi chọn file từ máy tính
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file) // 'file' phải khớp với tham số IFormFile file trong C#

    setUploadingImg(true)
    try {
      // Gọi API UploadsController của Backend
      const { data } = await api.post('/api/Uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      // Backend trả về: { Message: "...", Url: "https://localhost:7226/uploads/products/xxx.jpg" }
      setForm({ ...form, imageUrl: data.url })
      toast.success('Tải ảnh lên thành công!')
    } catch (err) {
      toast.error('Lỗi tải ảnh: ' + (err.response?.data || err.message))
    } finally {
      setUploadingImg(false)
    }
  }

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([api.get('/api/Products'), api.get('/api/Categories')])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (product) => {
    setEditProduct(product)
    setForm({ name: product.name, basePrice: product.basePrice, categoryId: product.categoryId, imageUrl: product.imageUrl || '', status: product.status, vendorId: '00000000-0000-0000-0000-000000000001' })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, basePrice: parseFloat(form.basePrice), categoryId: parseInt(form.categoryId) }
      if (editProduct) {
        await api.put(`/api/Products/${editProduct.id}`, payload)
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        await api.post('/api/Products', payload)
        toast.success('Thêm sản phẩm thành công!')
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data || 'Có lỗi xảy ra!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa sản phẩm "${name}"?`)) return
    try {
      await api.delete(`/api/Products/${id}`)
      toast.success('Đã xóa sản phẩm!')
      fetchAll()
    } catch (err) { toast.error(err.response?.data || 'Không thể xóa!') }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) return
    try {
      await api.post('/api/Products/delete-bulk', selectedIds)
      toast.success(`Đã xóa ${selectedIds.length} sản phẩm!`)
      setSelectedIds([])
      fetchAll()
    } catch (err) { toast.error(err.response?.data || 'Xóa hàng loạt thất bại!') }
  }

  const toggleSelect = (id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  const toggleSelectAll = () => { if (selectedIds.length === products.length) setSelectedIds([]); else setSelectedIds(products.map((p) => p.id)) }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>Đang tải...</div>

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📦 Quản lý Sản phẩm</h1>
          <p style={s.sub}>{products.length} sản phẩm trong hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedIds.length > 0 && (
            <button style={s.bulkDeleteBtn} onClick={handleBulkDelete}>🗑 Xóa {selectedIds.length} sản phẩm</button>
          )}
          <button style={s.addBtn} onClick={openAdd}>+ Thêm sản phẩm</button>
        </div>
      </div>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}><input type="checkbox" checked={selectedIds.length === products.length && products.length > 0} onChange={toggleSelectAll} /></th>
              {['Ảnh', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Đánh giá', 'Trạng thái', 'Thao tác'].map(h => <th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ background: selectedIds.includes(product.id) ? '#fff5f3' : '#fff' }}>
                <td style={s.td}><input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                <td style={s.td}>
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={s.thumb} /> : <div style={s.thumbPlaceholder}>📦</div>}
                </td>
                <td style={{ ...s.td, fontWeight: 600 }}>{product.name}</td>
                <td style={s.td}><span style={s.catBadge}>{product.categoryName}</span></td>
                <td style={{ ...s.td, fontWeight: 700, color: '#ee4d2d' }}>{formatPrice(product.basePrice)}</td>
                <td style={s.td}>⭐ {product.averageRating?.toFixed(1) || '0.0'}</td>
                <td style={s.td}>
                  <span style={{ ...s.statusBadge, background: product.status === 'Active' ? '#d1fae5' : '#fee2e2', color: product.status === 'Active' ? '#065f46' : '#991b1b' }}>
                    {product.status === 'Active' ? '✅ Hoạt động' : '⛔ Ẩn'}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={s.editBtn} onClick={() => openEdit(product)}>✏ Sửa</button>
                    <button style={s.deleteBtn} onClick={() => handleDelete(product.id, product.name)}>🗑 Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editProduct ? '✏ Sửa sản phẩm' : '+ Thêm sản phẩm mới'}</h2>
            <form onSubmit={handleSave}>
              <label style={s.label}>Tên sản phẩm *</label>
              <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <label style={s.label}>Giá (VNĐ) *</label>
              <input style={s.input} type="number" value={form.basePrice} onChange={e => setForm({ ...form, basePrice: e.target.value })} required min="0" />
              <label style={s.label}>Danh mục *</label>
              <select style={s.input} value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <label style={s.label}>Ảnh sản phẩm (Tải lên từ máy)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ flex: 1 }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    style={{ ...s.input, marginBottom: 4 }} 
                    disabled={uploadingImg}
                  />
                  {uploadingImg && <span style={{ fontSize: 12, color: '#ee4d2d', fontWeight: 600 }}>⏳ Đang tải ảnh lên máy chủ...</span>}
                </div>
                
                {form.imageUrl && (
                  <img 
                    src={form.imageUrl} 
                    alt="Preview" 
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} 
                  />
                )}
              </div>

              {editProduct && (
                <>
                  <label style={s.label}>Trạng thái</label>
                  <select style={s.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Hoạt động</option>
                    <option value="Inactive">Ẩn</option>
                  </select>
                </>
              )}
              <div style={s.modalBtns}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" style={s.saveBtn} disabled={saving || uploadingImg}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
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
  addBtn: { padding: '10px 20px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  bulkDeleteBtn: { padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', background: '#f9fafb', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  thumb: { width: 48, height: 48, objectFit: 'cover', borderRadius: 6 },
  thumbPlaceholder: { width: 48, height: 48, background: '#f3f4f6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  catBadge: { background: '#ede9fe', color: '#5b21b6', padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  statusBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  editBtn: { padding: '5px 12px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  deleteBtn: { padding: '5px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, width: 480, maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#111' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  cancelBtn: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 },
  saveBtn: { padding: '10px 24px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
}
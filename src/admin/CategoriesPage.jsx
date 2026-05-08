import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axiosConfig'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm] = useState({ name: '', parentId: '', isActive: true })
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(null)

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/Categories')
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const openAdd = () => { setEditCat(null); setForm({ name: '', parentId: '', isActive: true }); setShowModal(true) }
  const openEdit = (cat) => { setEditCat(cat); setForm({ name: cat.name, parentId: cat.parentId || '', isActive: cat.isActive }); setShowModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { name: form.name, parentId: form.parentId ? parseInt(form.parentId) : null, isActive: form.isActive }
      if (editCat) {
        await api.put(`/api/Categories/${editCat.id}`, payload)
        toast.success('Cập nhật danh mục thành công!')
      } else {
        await api.post('/api/Categories', payload)
        toast.success('Thêm danh mục thành công!')
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data || 'Có lỗi xảy ra!')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (cat) => {
    setToggling(cat.id)
    try {
      await api.patch(`/api/Categories/${cat.id}/toggle-status`)
      toast.success(`Danh mục "${cat.name}" đã ${cat.isActive ? 'bị ẩn' : 'được hiện'}!`)
      fetchCategories()
    } catch {
      toast.error('Không thể thay đổi trạng thái!')
    } finally {
      setToggling(null)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}>Đang tải...</div>

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📂 Quản lý Danh mục</h1>
          <p style={s.sub}>{categories.length} danh mục</p>
        </div>
        <button style={s.addBtn} onClick={openAdd}>+ Thêm danh mục</button>
      </div>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr>{['ID', 'Tên danh mục', 'Danh mục cha', 'Trạng thái', 'Thao tác'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td style={s.td}><span style={s.idBadge}>#{cat.id}</span></td>
                <td style={{ ...s.td, fontWeight: 700, fontSize: 14 }}>{cat.name}</td>
                <td style={s.td}>
                  {cat.parentId ? categories.find(c => c.id === cat.parentId)?.name || `#${cat.parentId}` : <span style={s.rootBadge}>📁 Danh mục gốc</span>}
                </td>
                <td style={s.td}>
                  <label style={s.toggleLabel}>
                    <div
                      style={{ ...s.toggleTrack, background: cat.isActive ? '#22c55e' : '#d1d5db', opacity: toggling === cat.id ? 0.6 : 1 }}
                      onClick={() => !toggling && handleToggleStatus(cat)}
                    >
                      <div style={{ ...s.toggleThumb, transform: cat.isActive ? 'translateX(22px)' : 'translateX(2px)' }} />
                    </div>
                    <span style={{ fontSize: 13, color: cat.isActive ? '#16a34a' : '#9ca3af', fontWeight: 600 }}>
                      {toggling === cat.id ? '...' : cat.isActive ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </label>
                </td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => openEdit(cat)}>✏ Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>{editCat ? '✏ Sửa danh mục' : '+ Thêm danh mục mới'}</h2>
            <form onSubmit={handleSave}>
              <label style={s.label}>Tên danh mục *</label>
              <input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <label style={s.label}>Danh mục cha (để trống nếu là gốc)</label>
              <select style={s.input} value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}>
                <option value="">-- Không có (Danh mục gốc) --</option>
                {categories.filter(c => c.id !== editCat?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                Hiển thị danh mục
              </label>
              <div style={s.modalBtns}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" style={s.saveBtn} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
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
  tableCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', background: '#f9fafb', textAlign: 'left', fontSize: 13, fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '14px 16px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  idBadge: { background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 },
  rootBadge: { background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  toggleLabel: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  toggleTrack: { width: 46, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleThumb: { position: 'absolute', top: 2, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
  editBtn: { padding: '5px 14px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, width: 440 },
  modalTitle: { fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#111' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' },
  modalBtns: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 },
  cancelBtn: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 },
  saveBtn: { padding: '10px 24px', background: '#ee4d2d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
}
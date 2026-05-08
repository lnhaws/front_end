import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// 1. Import Contexts (Đúng)
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

// 2. Import Layouts (Sửa lại đường dẫn thêm ./components/)
import UserLayout from './components/layouts/UserLayout'
import AdminLayout from './components/layouts/AdminLayout'

// 3. Import Auth Pages (Sửa lại đường dẫn thêm ./pages/auth/)
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// 4. Import User Pages (Sửa lại đường dẫn bỏ chữ /pages/)
import HomePage from './user/HomePage'
import ProductDetailPage from './user/ProductDetailPage'
import CartPage from './user/CartPage'
import CheckoutPage from './user/CheckoutPage'
import ThankYouPage from './user/ThankYouPage'

// 5. Import Admin Pages (Sửa lại đường dẫn bỏ chữ /pages/)
import DashboardPage from './admin/DashboardPage'
import ProductsPage from './admin/ProductsPage'
import CategoriesPage from './admin/CategoriesPage'
import VouchersPage from './admin/VouchersPage'
import UsersPage from './admin/UsersPage'
import ReviewsPage from './admin/ReviewsPage'

// 6. Import Component (Sửa lại đường dẫn thêm ./components/common/)
import ProtectedRoute from './components/common/ProtectedRoute'

// ... (Giữ nguyên phần function App() { return ... } bên dưới của bạn)
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<UserLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
            </Route>

            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="vouchers" element={<VouchersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
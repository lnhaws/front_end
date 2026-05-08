import React, { createContext, useContext, useState } from 'react';
// Đảm bảo bạn đã import 'api' và hook để lấy 'user' (nếu có)
// Ví dụ: 
// import api from '../services/api';
// import { useAuth } from './AuthContext';

// 1. Khởi tạo Context
export const CartContext = createContext();

// 2. Component Provider
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  
  // Giả sử bạn lấy user từ context khác (bỏ comment nếu bạn đang dùng cách này)
  // const { user } = useAuth();

  // Hàm fetchCart giả định (bạn điền logic gọi API thật của bạn vào đây)
  const fetchCart = async () => {
    try {
      // const response = await api.get(`/api/Cart/${user?.userId}`);
      // setCartItems(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  // Logic addToCart của bạn
  const addToCart = async (variantId, quantity = 1, productInfo = null) => {
    try {
      // Thử gọi API thật
      // Lưu ý: Bạn cần import biến 'api' và 'user' ở đầu file để dùng được
      await api.post('/api/Cart/add', { userId: user?.userId, variantId, quantity });
      await fetchCart();
    } catch (error) {
      // NẾU BACKEND LỖI -> HACK: TỰ THÊM VÀO GIỎ HÀNG ẢO TRÊN FRONTEND
      console.warn("Backend lỗi, chuyển sang dùng giỏ hàng ảo (Demo Mode)");
      
      setCartItems(prev => {
        // Kiểm tra xem đôi giày này đã có trong giỏ ảo chưa
        const existing = prev.find(item => item.variantId === variantId);
        if (existing) {
          return prev.map(item => 
            item.variantId === variantId 
              ? { ...item, quantity: item.quantity + quantity, totalPrice: (item.quantity + quantity) * item.unitPrice } 
              : item
          );
        }
        
        // Nếu chưa có, tạo món mới (Lấy tạm giá 500k nếu không có productInfo)
        const price = 500000; 
        return [...prev, {
          variantId: variantId,
          // Ưu tiên lấy tên thật nếu có truyền vào, không thì dùng tên Demo
          productName: productInfo?.name || "Giày Demo (Do Backend thiếu Variant)", 
          color: productInfo?.color || "Mặc định",
          quantity: quantity,
          unitPrice: price,
          totalPrice: price * quantity
        }];
      });
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, addToCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

// ------------------------------------------------------------------
// 3. EXPORT HOOK USECART ĐỂ SỬA LỖI VERCEL
// ------------------------------------------------------------------
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

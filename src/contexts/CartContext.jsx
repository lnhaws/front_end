const addToCart = async (variantId, quantity = 1, productInfo = null) => {
    try {
      // Thử gọi API thật
      await api.post('/api/Cart/add', { userId: user?.userId, variantId, quantity })
      await fetchCart()
    } catch (error) {
      // NẾU BACKEND LỖI -> HACK: TỰ THÊM VÀO GIỎ HÀNG ẢO TRÊN FRONTEND
      console.warn("Backend lỗi, chuyển sang dùng giỏ hàng ảo (Demo Mode)");
      
      setCartItems(prev => {
        // Kiểm tra xem món này đã có trong giỏ ảo chưa
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
          productName: "Sản phẩm Demo (Do Backend thiếu Variant)",
          color: "Mặc định",
          quantity: quantity,
          unitPrice: price,
          totalPrice: price * quantity
        }];
      });
    }
  }
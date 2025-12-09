import { createContext, useState, useEffect } from "react";

// Create the context with default values
const CartContext = createContext({
  cart: [],
  cartTotal: 0,
  cartCount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      // Load cart from localStorage
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.max(1, item.quantity + (quantity || 1)),
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          id: product.id,
          name: product.title || product.name || "Unnamed Product",
          price: Number(product.price) || 0,
          images: product.images?.[0] || "",
          quantity: Math.max(1, quantity || 1),
          seller_id: product.seller_id || null,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    if (!productId) return;
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (!productId || newQuantity === undefined) return;

    const quantity = Number(newQuantity);
    if (isNaN(quantity) || quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, Math.floor(quantity)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate cart total and count
  const cartTotal = cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  const cartCount = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext };

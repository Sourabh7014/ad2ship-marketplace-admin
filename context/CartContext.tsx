"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";

import { resolveImageUrl } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  productPrice: number | string;
  mrp: number | string;
  sku?: string;
  images?: string[];
  [key: string]: any;
}

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  productTitle?: string;
  productSku?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number | string;
  mrp: number | string;
  taxPercentage: number;
  discountAmount: number | string;
  lineTotal: number | string;
}

interface Cart {
  id: string;
  sellerId: string;
  storeId: string;
  subtotal: number | string;
  taxAmount: number | string;
  discountAmount: number | string;
  shippingCharge: number | string;
  grandTotal: number | string;
  currency: string;
  status: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loadCart: (storeId: string, sellerId: string) => Promise<void>;
  addToCart: (product: any, quantity: number, variantId?: string, showUser?: boolean) => Promise<boolean>;
  createBuyNowCart: (product: any, quantity: number, variantId?: string) => Promise<number | null>;
  updateCartItemQty: (cartItemId: string, quantity: number) => Promise<void>;
  removeCartItem: (cartItemId: string) => Promise<void>;
  isMockCart: boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const mapBackendCart = (cartData: any): Cart => {
  if (!cartData) return cartData;
  return {
    ...cartData,
    items: (cartData.items || []).map((item: any) => {
      const prod = item.product || {};
      const images = Array.isArray(prod.images) ? prod.images : [];
      const title = prod.name || item.productTitle || "";
      return {
        ...item,
        productId: String(item.productId || prod.id || ""),
        // variantId ko bhi productId ki tarah normalize karte hain, warna
        // number/string mismatch se variant match fail hota hai.
        variantId: item.variantId != null ? String(item.variantId) : undefined,
        productTitle: item.productTitle || title,
        productSku: item.productSku || prod.sku || "",
        product: {
          ...prod,
          id: String(prod.id || ""),
          slug: prod.slug || prod.id || item.productId,
          title: title,
          images: images,
          quantity: prod.quantity ?? 999,
          variants: (prod.variants || []).map((v: any) => ({
            id: String(v.id),
            name: v.name,
            price: Number(v.price),
            quantity: v.quantity ?? 999,
          })),
        },
      };
    }),
  };
};

const LOCAL_CART_KEY = "ad2ship_local_cart";
const LOCAL_CART_ID_KEY = "ad2ship_cart_id";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isMockCart, setIsMockCart] = useState(false);

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Local storage mock helpers
  const loadLocalCart = useCallback((storeId: string, sellerId: string) => {
    const localData = localStorage.getItem(LOCAL_CART_KEY);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.storeId === storeId) {
          setCart(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse local cart data", e);
      }
    }

    // Default empty cart structure
    const emptyCart: Cart = {
      id: "local-mock-cart",
      storeId,
      sellerId,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      shippingCharge: 0,
      grandTotal: 0,
      currency: "INR",
      status: "active",
      items: [],
    };
    setCart(emptyCart);
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(emptyCart));
  }, []);

  const saveLocalCart = useCallback((updatedCart: Cart) => {
    // Recalculate summary totals locally
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    updatedCart.items.forEach((item) => {
      subtotal += Number(item.lineTotal);
      taxAmount += (Number(item.unitPrice) * item.quantity * item.taxPercentage) / 100;
      discountAmount += Number(item.discountAmount);
    });

    const shippingCharge = subtotal >= 999 || subtotal === 0 ? 0 : 100;
    const grandTotal = subtotal + taxAmount - discountAmount + shippingCharge;

    const finalCart = {
      ...updatedCart,
      subtotal,
      taxAmount,
      discountAmount,
      shippingCharge,
      grandTotal,
    };

    setCart(finalCart);
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(finalCart));
  }, []);

  // Load cart on init
  const loadCart = useCallback(async (storeId: string, sellerId: string) => {
    if (!storeId || !sellerId) return;

    const savedCartId = typeof window !== "undefined" ? localStorage.getItem(LOCAL_CART_ID_KEY) : null;
    const validSavedId = (savedCartId && savedCartId !== "local-mock-cart" && !isNaN(Number(savedCartId))) ? Number(savedCartId) : undefined;

    try {
      const response = await axios.post(`/api/user/public/storefront/cart`, {
        storeId,
        sellerId,
        cartId: validSavedId,
      }, {
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
      });

      const cartData = response.data?.data;
      if (cartData) {
        setCart(mapBackendCart(cartData));
        localStorage.setItem(LOCAL_CART_ID_KEY, String(cartData.id));
        setIsMockCart(false);
        return;
      }
    } catch (error) {
      console.warn("Backend cart API failed, falling back to local mock cart:", error);
    }

    // Fallback: LocalStorage Mock Cart
    setIsMockCart(true);
    loadLocalCart(storeId, sellerId);
  }, [loadLocalCart]);

  // Add to Cart
  const addToCart = useCallback(async (product: any, quantity: number, variantId?: string, _showUser: boolean = false) => {
    if (!cart) {
      toast.error("Cart not loaded yet. Please wait.");
      return false;
    }

    // Parse product details properly
    const prodPrice = Number(product.price || product.productPrice || 0);
    const prodMrp = Number(product.mrp || product.origPrice || prodPrice);
    const prodTitle = product.name || product.title || "";
    const prodSku = product.sku || "";

    // Stock Check
    let availableStock = Number(product.quantity ?? 999);
    if (variantId && product.variants) {
      const variant = product.variants.find((v: any) => v.id === variantId);
      if (variant) {
        availableStock = Number(variant.quantity ?? 999);
      }
    }

    // ID cart me string hoti hai par product API se number aa sakti hai, isliye
    // String() dono taraf — warna same item dobara add hone par duplicate row
    // ban jaati hai.
    const existingItem = cart.items.find(
      (item) =>
        String(item.productId) === String(product.id) &&
        String(item.variantId ?? "") === String(variantId ?? "")
    );
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + quantity > availableStock) {
      toast.error(`Cannot add. Only ${availableStock} items available in stock.`);
      return false;
    }

    let activeCartId: string | number = cart.id;

    // If cart is currently mock or placeholder string, initialize real DB cart on backend first
    if (isMockCart || activeCartId === "local-mock-cart" || isNaN(Number(activeCartId))) {
      try {
        const createRes = await axios.post(`/api/user/public/storefront/cart`, {
          storeId: cart.storeId,
          sellerId: cart.sellerId,
        }, {
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
        });
        const createdCart = createRes.data?.data;
        if (createdCart?.id) {
          activeCartId = createdCart.id;
          localStorage.setItem(LOCAL_CART_ID_KEY, String(createdCart.id));
          setIsMockCart(false);
        }
      } catch (e) {
        console.warn("Failed to create remote backend cart during addToCart:", e);
      }
    }

    try {
      const response = await axios.post(`/api/user/public/storefront/cart/item`, {
        cartId: Number(activeCartId),
        productId: product.id,
        variantId,
        quantity,
      }, {
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
      });

      const updated = response.data?.data;
      if (updated) {
        setCart(mapBackendCart(updated));
        setIsCartOpen(true);
        return true;
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Out of stock.");
        return false;
      }
      console.warn("Backend add-to-cart failed. Performing local add:", err);
    }

    // Local Mock Fallback
    const existingIndex = cart.items.findIndex(
      (item) =>
        String(item.productId) === String(product.id) &&
        String(item.variantId ?? "") === String(variantId ?? "")
    );

    const updatedItems = [...cart.items];

    if (existingIndex > -1) {
      const existing = updatedItems[existingIndex];
      const newQty = existing.quantity + quantity;
      updatedItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        lineTotal: Number(existing.unitPrice) * newQty,
      };
    } else {
      const mockItem: CartItem = {
        id: `local-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cartId: cart.id,
        productId: product.id,
        product: {
          id: product.id,
          slug: product.slug || product.id,
          title: prodTitle,
          productPrice: prodPrice,
          mrp: prodMrp,
          sku: prodSku,
          images: (product.images || [product.image || "/uploads/placeholder_product.png"]).map(resolveImageUrl),
        },
        productTitle: prodTitle,
        productSku: prodSku,
        variantId,
        variantName: product.variant || undefined,
        quantity,
        unitPrice: prodPrice,
        mrp: prodMrp,
        taxPercentage: 18,
        discountAmount: 0,
        lineTotal: prodPrice * quantity,
      };
      updatedItems.push(mockItem);
    }

    saveLocalCart({ ...cart, items: updatedItems });
    setIsCartOpen(true);
    return true;
  }, [cart, isMockCart, saveLocalCart]);

  /**
   * Buy Now ka "direct payment" path: sirf is product ke liye ek alag cart
   * banata hai aur uski id lautata hai.
   *
   * Ye jaan-boojh kar context ke `cart` ko nahi chhoota — user ka shopping cart
   * jaisa hai waisa hi rehna chahiye, aur checkout sirf is naye cart par chalega.
   * localStorage ka cart id bhi nahi badalta, warna agli baar load hone par
   * shopping cart ki jagah ye single-item cart aa jaata.
   */
  const createBuyNowCart = useCallback(async (product: any, quantity: number, variantId?: string) => {
    if (!cart?.storeId || !cart?.sellerId) {
      toast.error("Store not ready. Please refresh and try again.");
      return null;
    }

    // Stock check — addToCart wali hi limit, par yahan cart khali hai isliye
    // maujuda quantity add karne ki zarurat nahi.
    let availableStock = Number(product.quantity ?? 999);
    if (variantId && product.variants) {
      const variant = product.variants.find((v: any) => String(v.id) === String(variantId));
      if (variant) availableStock = Number(variant.quantity ?? 999);
    }
    if (quantity > availableStock) {
      toast.error(`Cannot buy. Only ${availableStock} items available in stock.`);
      return null;
    }

    try {
      // cartId bheje bina POST karne par backend naya cart banata hai.
      const createRes = await axios.post(`/api/user/public/storefront/cart`, {
        storeId: cart.storeId,
        sellerId: cart.sellerId,
      }, {
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
      });

      const newCartId = createRes.data?.data?.id;
      if (!newCartId) {
        toast.error("Could not start checkout. Please try again.");
        return null;
      }

      await axios.post(`/api/user/public/storefront/cart/item`, {
        cartId: Number(newCartId),
        productId: product.id,
        variantId,
        quantity,
      }, {
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
      });

      return Number(newCartId);
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Out of stock.");
        return null;
      }
      console.error("Failed to create buy-now cart:", err);
      toast.error("Could not start checkout. Please try again.");
      return null;
    }
  }, [cart]);

  // Update Cart Item Quantity
  const updateCartItemQty = useCallback(async (cartItemId: string, quantity: number) => {
    if (!cart) return;

    const item = cart.items.find((i) => i.id === cartItemId);
    if (item && quantity > item.quantity) {
      let availableStock = Number(item.product?.quantity ?? 999);
      if (item.variantId && item.product?.variants) {
        const variant = item.product.variants.find((v: any) => v.id === item.variantId);
        if (variant) {
          availableStock = Number(variant.quantity ?? 999);
        }
      }
      if (quantity > availableStock) {
        toast.error(`Cannot increase quantity. Only ${availableStock} items available in stock.`);
        return;
      }
    }

    if (!isMockCart) {
      try {
        const response = await axios.put(`/api/user/public/storefront/cart/item`, {
          cartId: cart.id,
          cartItemId,
          quantity,
        }, {
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
        });

        const updated = response.data?.data;
        if (updated) {
          setCart(mapBackendCart(updated));
          return;
        }
      } catch (err: any) {
        if (err.response?.status === 400) {
          toast.error(err.response?.data?.message || "Out of stock.");
          return;
        }
        console.warn("Backend update quantity failed. Performing local update:", err);
      }
    }

    // Local Mock Fallback
    const updatedItems = [...cart.items];
    const index = updatedItems.findIndex((item) => item.id === cartItemId);

    if (index > -1) {
      if (quantity <= 0) {
        updatedItems.splice(index, 1);
      } else {
        const item = updatedItems[index];
        updatedItems[index] = {
          ...item,
          quantity,
          lineTotal: Number(item.unitPrice) * quantity,
        };
      }
      saveLocalCart({ ...cart, items: updatedItems });
    }
  }, [cart, isMockCart, saveLocalCart]);

  // Remove Cart Item
  const removeCartItem = useCallback(async (cartItemId: string) => {
    if (!cart) return;

    if (!isMockCart) {
      try {
        const response = await axios.delete(
          `/api/user/public/storefront/cart/item/${cartItemId}?cartId=${cart.id}`,
          { headers: { "ngrok-skip-browser-warning": "true" } }
        );

        const updated = response.data?.data;
        if (updated) {
          setCart(mapBackendCart(updated));
          return;
        }
      } catch (err) {
        console.warn("Backend remove item failed. Performing local remove:", err);
      }
    }

    // Local Mock Fallback
    const updatedItems = cart.items.filter((item) => item.id !== cartItemId);
    saveLocalCart({ ...cart, items: updatedItems });
  }, [cart, isMockCart, saveLocalCart]);

  const clearCart = useCallback(() => {
    setCart(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_CART_KEY);
      localStorage.removeItem(LOCAL_CART_ID_KEY);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loadCart,
        addToCart,
        createBuyNowCart,
        updateCartItemQty,
        removeCartItem,
        isMockCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

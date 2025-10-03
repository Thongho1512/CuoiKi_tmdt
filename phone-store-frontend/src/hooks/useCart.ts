import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCart, addToCart, updateCartItem, removeCartItem, clearCart } from '@/store/slices/cartSlice';
import { AddToCartRequest } from '@/types/cart.types';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cart, loading } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const handleAddToCart = (data: AddToCartRequest) => {
    return dispatch(addToCart(data));
  };

  const handleUpdateItem = (itemId: number, quantity: number) => {
    return dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemoveItem = (itemId: number) => {
    return dispatch(removeCartItem(itemId));
  };

  const handleClearCart = () => {
    return dispatch(clearCart());
  };

  const cartItemCount = cart?.totalItems || 0;
  const cartTotal = cart?.totalAmount || 0;

  return {
    cart,
    loading,
    cartItemCount,
    cartTotal,
    addToCart: handleAddToCart,
    updateItem: handleUpdateItem,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
  };
};

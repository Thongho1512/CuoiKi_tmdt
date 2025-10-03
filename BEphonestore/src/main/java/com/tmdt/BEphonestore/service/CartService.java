package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.dto.request.CartItemRequest;
import com.tmdt.BEphonestore.dto.response.CartResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;

public interface CartService {
    CartResponse getMyCart();

    CartResponse addToCart(CartItemRequest request);

    CartResponse updateCartItem(Long itemId, Integer quantity);

    MessageResponse removeFromCart(Long itemId);

    MessageResponse clearCart();
}
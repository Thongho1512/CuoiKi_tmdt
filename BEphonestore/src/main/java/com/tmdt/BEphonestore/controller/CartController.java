package com.tmdt.BEphonestore.controller;

import com.tmdt.BEphonestore.dto.request.CartItemRequest;
import com.tmdt.BEphonestore.dto.response.CartResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Cart Controller
 */
@RestController
@RequestMapping("/cart")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart() {
        CartResponse cart = cartService.getMyCart();
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody CartItemRequest request) {
        CartResponse cart = cartService.addToCart(request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<CartResponse> updateCartItem(@PathVariable Long itemId,
            @RequestParam Integer quantity) {
        CartResponse cart = cartService.updateCartItem(itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<MessageResponse> removeFromCart(@PathVariable Long itemId) {
        MessageResponse response = cartService.removeFromCart(itemId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<MessageResponse> clearCart() {
        MessageResponse response = cartService.clearCart();
        return ResponseEntity.ok(response);
    }
}

package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.dto.request.LoginRequest;
import com.tmdt.BEphonestore.dto.request.RegisterRequest;
import com.tmdt.BEphonestore.dto.response.JwtResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.entity.Cart;
import com.tmdt.BEphonestore.entity.User;
import com.tmdt.BEphonestore.enums.UserRole;
import com.tmdt.BEphonestore.enums.UserStatus;
import com.tmdt.BEphonestore.exception.BadRequestException;
import com.tmdt.BEphonestore.repository.CartRepository;
import com.tmdt.BEphonestore.repository.UserRepository;
import com.tmdt.BEphonestore.security.JwtTokenProvider;
import com.tmdt.BEphonestore.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Auth Service Implementation
 */
@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        // Create new user
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        // Create cart for user
        Cart cart = Cart.builder()
                .user(user)
                .build();
        cartRepository.save(cart);

        return new MessageResponse("User registered successfully");
    }

    @Override
    public MessageResponse logout() {
        SecurityContextHolder.clearContext();
        return new MessageResponse("Logged out successfully");
    }
}

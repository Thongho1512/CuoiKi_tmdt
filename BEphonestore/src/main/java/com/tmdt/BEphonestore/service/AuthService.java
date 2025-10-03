package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.dto.request.LoginRequest;
import com.tmdt.BEphonestore.dto.request.RegisterRequest;
import com.tmdt.BEphonestore.dto.response.JwtResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;

public interface AuthService {
    JwtResponse login(LoginRequest request);

    MessageResponse register(RegisterRequest request);

    MessageResponse logout();
}

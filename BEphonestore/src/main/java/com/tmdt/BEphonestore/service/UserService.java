package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.dto.request.ChangePasswordRequest;
import com.tmdt.BEphonestore.dto.request.UpdateProfileRequest;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getCurrentUser();

    UserResponse getUserById(Long id);

    UserResponse updateProfile(UpdateProfileRequest request);

    MessageResponse changePassword(ChangePasswordRequest request);

    Page<UserResponse> getAllUsers(Pageable pageable);

    Page<UserResponse> searchUsers(String keyword, Pageable pageable);

    MessageResponse updateUserStatus(Long id, String status);

    MessageResponse deleteUser(Long id);
}
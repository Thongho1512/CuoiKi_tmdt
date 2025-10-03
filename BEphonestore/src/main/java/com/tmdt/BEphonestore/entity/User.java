package com.tmdt.BEphonestore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.tmdt.BEphonestore.enums.UserRole;
import com.tmdt.BEphonestore.enums.UserStatus;

import java.time.LocalDateTime;

/**
 * User Entity
 */
@Entity
@Table(name = "Users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50, columnDefinition = "NVARCHAR(MAX)")
    private String username;

    @Column(length = 255)
    private String password;

    @Column(unique = true, length = 100)
    private String email;

    @Column(length = 100, columnDefinition = "NVARCHAR(MAX)")
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(length = 500, columnDefinition = "NVARCHAR(MAX)")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (role == null)
            role = UserRole.CUSTOMER;
        if (status == null)
            status = UserStatus.ACTIVE;
    }
}
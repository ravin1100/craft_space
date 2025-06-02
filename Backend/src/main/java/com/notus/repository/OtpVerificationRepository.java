package com.notus.repository;

import com.notus.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    @Query("SELECT o FROM OtpVerification o WHERE o.email = :email AND o.otp = :otp AND o.expiresAt > :now AND o.isUsed = false")
    Optional<OtpVerification> findValidOtp(String email, String otp, LocalDateTime now);
    
    @Query("SELECT o FROM OtpVerification o WHERE o.email = :email AND o.expiresAt > :now AND o.isUsed = false ORDER BY o.createdAt DESC")
    Optional<OtpVerification> findLatestValidOtpByEmail(String email, LocalDateTime now);
} 
package com.notus.service;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.notus.dto.auth.AuthResponse;
import com.notus.dto.auth.LoginRequest;
import com.notus.dto.auth.SignupRequest;
import com.notus.dto.auth.VerifyOtpRequest;
import com.notus.entity.OtpVerification;
import com.notus.entity.User;
import com.notus.entity.Workspace;
import com.notus.repository.OtpVerificationRepository;
import com.notus.repository.UserRepository;
import com.notus.repository.WorkspaceRepository;
import com.notus.security.JwtTokenProvider;
import com.notus.security.UserPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final UserDetailsService userDetailsService;
    private final WorkspaceRepository workspaceRepository;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        log.info("Starting signup process for email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Signup failed - Email already registered: {}", request.getEmail());
            throw new RuntimeException("Email is already registered");
        }

        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmailVerified(true);
            User savedUser = userRepository.save(user);
            log.debug("User created successfully: {}", user.getEmail());

            String otp = generateOtp();
            OtpVerification otpVerification = new OtpVerification();
            otpVerification.setEmail(user.getEmail());
            otpVerification.setOtp(otp);
            otpVerification.setExpiresAt(LocalDateTime.now().plusMinutes(15));
            otpVerificationRepository.save(otpVerification);
            log.debug("OTP generated and saved for user: {}", user.getEmail());

//            emailService.sendOtpEmail(user.getEmail(), otp);
            log.info("Signup completed successfully for email: {}", request.getEmail());

//            return AuthResponse.builder()
//                    .message("Please verify your email address")
//                    .build();
            
            LoginRequest loginRequest =  new LoginRequest();
            loginRequest.setEmail(request.getEmail());
            loginRequest.setPassword(request.getPassword());
            
            AuthResponse response = this.login(loginRequest);
            
            Workspace workspace = new Workspace();
            workspace.setName("Default Workspace");
            workspace.setOwner(savedUser);

            workspace = workspaceRepository.save(workspace);
            response.setWorkspaceId(workspace.getId());
            return response;
        } catch (Exception e) {
            log.error("Error during signup process for email: {}", request.getEmail(), e);
            throw e;
        }
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        log.info("Starting OTP verification for email: {}", request.getEmail());
        
        try {
            OtpVerification otpVerification = otpVerificationRepository
                    .findValidOtp(request.getEmail(), request.getOtp(), LocalDateTime.now())
                    .orElseThrow(() -> {
                        log.warn("Invalid or expired OTP for email: {}", request.getEmail());
                        return new RuntimeException("Invalid or expired OTP");
                    });

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> {
                        log.error("User not found during OTP verification: {}", request.getEmail());
                        return new RuntimeException("User not found");
                    });

            user.setEmailVerified(true);
            userRepository.save(user);
            log.debug("Email verified for user: {}", user.getEmail());

            otpVerification.setUsed(true);
            otpVerificationRepository.save(otpVerification);
            log.debug("OTP marked as used for user: {}", user.getEmail());

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            String jwt = tokenProvider.generateToken(userDetails.getUsername());
            log.info("OTP verification completed successfully for email: {}", request.getEmail());

            return createAuthResponse(user, jwt);
        } catch (Exception e) {
            log.error("Error during OTP verification for email: {}", request.getEmail(), e);
            throw e;
        }
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Starting login process for email: {}", request.getEmail());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            Object principal = authentication.getPrincipal();
            String username;

            if (principal instanceof UserPrincipal) {
                username = ((UserPrincipal) principal).getUsername();
            } else {
                username = principal.toString();
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(username);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            log.info("Login successful for email: {}", request.getEmail());
            return createAuthResponse(user, jwt);
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            throw e;
        }
    }

    public AuthResponse refreshToken(String token) {
        log.info("Starting token refresh process");
        
        try {
            if (!tokenProvider.validateToken(token)) {
                log.warn("Invalid token provided for refresh");
                throw new RuntimeException("Invalid token");
            }

            String email = tokenProvider.getUserNameFromToken(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("User not found during token refresh: {}", email);
                        return new RuntimeException("User not found");
                    });

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, "")
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            Object principal = authentication.getPrincipal();
            String username;
            if (principal instanceof UserPrincipal) {
                username = ((UserPrincipal) principal).getUsername();
            } else {
                username = principal.toString();
            }
           
            String newToken = tokenProvider.generateToken(username);
            log.info("Token refresh completed successfully for user: {}", email);

            return createAuthResponse(user, newToken);
        } catch (Exception e) {
            log.error("Error during token refresh", e);
            throw e;
        }
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private AuthResponse createAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .build();
    }
} 
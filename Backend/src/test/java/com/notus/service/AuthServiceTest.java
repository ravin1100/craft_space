//package com.notus.service;
//
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.doNothing;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//import java.util.Optional;
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import com.notus.dto.auth.LoginRequest;
//import com.notus.dto.auth.SignupRequest;
//import com.notus.entity.OtpVerification;
//import com.notus.entity.User;
//import com.notus.exception.BadRequestException;
//import com.notus.repository.OtpVerificationRepository;
//import com.notus.repository.UserRepository;
//import com.notus.security.JwtTokenProvider;
//
//@ExtendWith(MockitoExtension.class)
//class AuthServiceTest {
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private OtpVerificationRepository otpVerificationRepository;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @Mock
//    private JwtTokenProvider jwtTokenProvider;
//
//    @Mock
//    private AuthenticationManager authenticationManager;
//
//    @Mock
//    private EmailService emailService;
//
//    @InjectMocks
//    private AuthService authService;
//
//    private SignupRequest signupRequest;
//    private LoginRequest loginRequest;
//    private User user;
//    private OtpVerification otpVerification;
//
//    @BeforeEach
//    void setUp() {
//        signupRequest = new SignupRequest();
//        signupRequest.setEmail("test@example.com");
//        signupRequest.setPassword("password");
//        signupRequest.setName("Test User");
//
//        loginRequest = new LoginRequest();
//        loginRequest.setEmail("test@example.com");
//        loginRequest.setPassword("password");
//
//        user = new User();
//        user.setId(1L);
//        user.setEmail("test@example.com");
//        user.setPassword("encodedPassword");
//        user.setName("Test User");
//        user.setEmailVerified(true);
//
//        otpVerification = new OtpVerification();
//        otpVerification.setId(1L);
//        otpVerification.setEmail("test@example.com");
//        otpVerification.setOtp("123456");
////        otpVerification.setExpiryTime(LocalDateTime.now().plusMinutes(5));
//    }
//
//    @Test
//    void signup_Success() {
//        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
//        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("encodedPassword");
//        when(userRepository.save(any(User.class))).thenReturn(user);
//        doNothing().when(emailService).sendOtpEmail(anyString(), anyString());
//
//        authService.signup(signupRequest);
//
//        verify(userRepository).save(any(User.class));
//        verify(otpVerificationRepository).save(any(OtpVerification.class));
//        verify(emailService).sendOtpEmail(anyString(), anyString());
//    }
//
//    @Test
//    void signup_EmailAlreadyExists() {
//        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);
//
//        assertThatThrownBy(() -> authService.signup(signupRequest))
//                .isInstanceOf(BadRequestException.class)
//                .hasMessageContaining("Email already registered");
//    }
//
//    @Test
//    void verifyOtp_Success() {
////        when(otpVerificationRepository.findLatestByEmail(anyString())).thenReturn(Optional.of(otpVerification));
////        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
////        when(userRepository.save(any(User.class))).thenReturn(user);
////        when(jwtTokenProvider.generateToken(anyLong())).thenReturn("token");
////        when(jwtTokenProvider.generateRefreshToken(anyLong())).thenReturn("refreshToken");
////
////        TokenResponse response = authService.verifyOtp("test@example.com", "123456");
////
////        assertThat(response.getAccessToken()).isEqualTo("token");
////        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
////        verify(userRepository).save(any(User.class));
//    }
//
//    @Test
//    void verifyOtp_InvalidOtp() {
////        when(otpVerificationRepository.findLatestByEmail(anyString())).thenReturn(Optional.of(otpVerification));
////
////        assertThatThrownBy(() -> authService.verifyOtp("test@example.com", "wrongOtp"))
////                .isInstanceOf(BadRequestException.class)
////                .hasMessageContaining("Invalid OTP");
//    }
//
//    @Test
//    void login_Success() {
//        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
////        when(jwtTokenProvider.generateToken(anyLong())).thenReturn("token");
////        when(jwtTokenProvider.generateRefreshToken(anyLong())).thenReturn("refreshToken");
//
////        TokenResponse response = authService.login(loginRequest);
//
////        assertThat(response.getAccessToken()).isEqualTo("token");
////        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
//        verify(authenticationManager).authenticate(
//                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
//        );
//    }
//
//    @Test
//    void login_EmailNotVerified() {
//        user.setEmailVerified(false);
//        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
//
//        assertThatThrownBy(() -> authService.login(loginRequest))
//                .isInstanceOf(BadRequestException.class)
//                .hasMessageContaining("Email not verified");
//    }
//} 
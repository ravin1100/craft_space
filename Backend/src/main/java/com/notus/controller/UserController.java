package com.notus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import com.notus.dto.ChangePasswordRequest;
import com.notus.dto.UpdateProfileRequest;
import com.notus.dto.UserResponse;
import com.notus.entity.User;
import com.notus.security.UserPrincipal;
import com.notus.security.CurrentUser;
import com.notus.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        User user = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(UserResponse.fromUser(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody UpdateProfileRequest updateProfileRequest) {
        
        User updatedUser = userService.updateUserProfile(
                userPrincipal.getId(),
                updateProfileRequest.getName(),
                updateProfileRequest.getBio(),
                updateProfileRequest.getProfilePicture()
        );
        
        return ResponseEntity.ok(UserResponse.fromUser(updatedUser));
    }
    
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @CurrentUser UserPrincipal userPrincipal,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        
        userService.changePassword(
                userPrincipal.getId(),
                changePasswordRequest.getCurrentPassword(),
                changePasswordRequest.getNewPassword()
        );
        
        return ResponseEntity.ok().body(Map.of("message", "Password changed successfully"));
    }
}

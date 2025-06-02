package com.notus.service;

import com.notus.entity.User;

public interface UserService {
    User updateUserProfile(Long userId, String firstName, String lastName, String profilePicture);
    User getUserById(Long userId);
}

package com.notus.service.impl;

import com.notus.entity.User;
import com.notus.exception.ResourceNotFoundException;
import com.notus.repository.UserRepository;
import com.notus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public User updateUserProfile(Long userId, String name, String profilePicture, String bio) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setName(name);
        if (profilePicture != null) {
            user.setProfilePicture(profilePicture);
        }
        user.setBio(bio);
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}

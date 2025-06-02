package com.notus.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String profilePicture; // Base64 encoded string
    private String bio;
}

package com.notus.dto.page;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PageRequest {
    @NotBlank(message = "Page title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    private String content;

    private String iconUrl;

    private Long parentId;

    private Integer sortOrder;
} 
package com.notus.dto.page;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse {
    private Long id;
    private String title;
    private String content;
    private String iconUrl;
    private Long workspaceId;
    private Long parentId;
    private List<PageResponse> children;
    private Integer sortOrder;
    private int childCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean bookmarked;
    private Long createdBy;
    private List<String> tags;
} 
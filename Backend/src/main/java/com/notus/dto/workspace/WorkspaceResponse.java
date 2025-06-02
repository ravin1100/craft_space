package com.notus.dto.workspace;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private Long ownerId;
    private String ownerName;
    private int pageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 
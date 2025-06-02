package com.notus.service;

import com.notus.dto.workspace.WorkspaceRequest;
import com.notus.dto.workspace.WorkspaceResponse;
import com.notus.entity.User;
import com.notus.entity.Workspace;
import com.notus.repository.UserRepository;
import com.notus.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private static final int MAX_WORKSPACES = 5;

    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long activeWorkspaces = workspaceRepository.findActiveWorkspacesByUserId(userId).size();
        if (activeWorkspaces >= MAX_WORKSPACES) {
            throw new RuntimeException("Maximum workspace limit reached (5)");
        }

        if (workspaceRepository.existsByNameAndOwnerIdAndDeletedAtIsNull(request.getName(), userId)) {
            throw new RuntimeException("Workspace with this name already exists");
        }

        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setIconUrl(request.getIconUrl());
        workspace.setOwner(user);

        workspace = workspaceRepository.save(workspace);
        return mapToResponse(workspace);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceResponse> getWorkspaces(Long userId) {
        return workspaceRepository.findActiveWorkspacesByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(Long workspaceId, Long userId) {
        Workspace workspace = workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        return mapToResponse(workspace);
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(Long workspaceId, WorkspaceRequest request, Long userId) {
        Workspace workspace = workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        if (!workspace.getName().equals(request.getName()) &&
                workspaceRepository.existsByNameAndOwnerIdAndDeletedAtIsNull(request.getName(), userId)) {
            throw new RuntimeException("Workspace with this name already exists");
        }

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setIconUrl(request.getIconUrl());

        workspace = workspaceRepository.save(workspace);
        return mapToResponse(workspace);
    }

    @Transactional
    public void deleteWorkspace(Long workspaceId, Long userId) {
        Workspace workspace = workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        workspace.setDeletedAt(LocalDateTime.now());
        workspaceRepository.save(workspace);
    }

    private WorkspaceResponse mapToResponse(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .iconUrl(workspace.getIconUrl())
                .ownerId(workspace.getOwner().getId())
                .ownerName(workspace.getOwner().getName())
                .pageCount(workspace.getPages().size())
                .createdAt(workspace.getCreatedAt())
                .updatedAt(workspace.getUpdatedAt())
                .build();
    }
} 
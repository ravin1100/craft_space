package com.notus.controller;

import com.notus.dto.workspace.WorkspaceRequest;
import com.notus.dto.workspace.WorkspaceResponse;
import com.notus.security.UserPrincipal;
import com.notus.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody WorkspaceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(workspaceService.createWorkspace(request, userPrincipal.getId()));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getWorkspaces(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(workspaceService.getWorkspaces(userPrincipal.getId()));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable Long workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(workspaceService.getWorkspace(workspaceId, userPrincipal.getId()));
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(
            @PathVariable Long workspaceId,
            @Valid @RequestBody WorkspaceRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(workspaceId, request, userPrincipal.getId()));
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(
            @PathVariable Long workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        workspaceService.deleteWorkspace(workspaceId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
} 
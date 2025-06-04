package com.notus.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.notus.dto.page.PageRequest;
import com.notus.dto.page.PageResponse;
import com.notus.security.UserPrincipal;
import com.notus.service.PageService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/pages")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @PostMapping
    @Operation(summary = "Create Page")
    public ResponseEntity<PageResponse> createPage(
            @PathVariable Long workspaceId,
            @Valid @RequestBody PageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(pageService.createPage(workspaceId, request, userPrincipal.getId()));
    }

    @GetMapping
    @Operation(summary = "Get all pages of a workspace")
    public ResponseEntity<List<PageResponse>> getRootPages(
            @PathVariable Long workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(pageService.getRootPages(workspaceId, userPrincipal.getId()));
    }

    @GetMapping("/{pageId}/children")
    public ResponseEntity<List<PageResponse>> getChildPages(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(pageService.getChildPages(workspaceId, pageId, userPrincipal.getId()));
    }

    @GetMapping("/{pageId}")
    @Operation(summary = "Get single page")
    public ResponseEntity<PageResponse> getPage(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(pageService.getPage(workspaceId, pageId, userPrincipal.getId()));
    }

    @PutMapping("/{pageId}")
    @Operation(summary = "Update page")
    public ResponseEntity<PageResponse> updatePage(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @Valid @RequestBody PageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(pageService.updatePage(workspaceId, pageId, request, userPrincipal.getId()));
    }

    @DeleteMapping("/{pageId}")
    @Operation(summary = "Soft delete page")
    public ResponseEntity<String> deletePage(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        pageService.deletePage(workspaceId, pageId, userPrincipal.getId());
        return ResponseEntity.ok("soft deleted");
    }
    
    @PutMapping("/{pageId}/bookmark")
    @Operation(summary = "Toggle favourites or bookmarks")
    public ResponseEntity<String> toggleBookmark(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @RequestParam boolean bookmarked,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        pageService.toggleBookmark(workspaceId, pageId, userPrincipal.getId(), bookmarked);
        return ResponseEntity.ok("bookmarked");
    }
    
    @GetMapping("/trash")
    @Operation(summary = "All trash pages")
    public ResponseEntity<List<PageResponse>> getDeletedPages(
            @PathVariable Long workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(pageService.getDeletedPages(workspaceId, userPrincipal.getId()));
    }
    
    @DeleteMapping("/trash/{pageId}")
    @Operation(summary = "Hard delete page")
    public ResponseEntity<String> hardDeletePage(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        pageService.hardDeletePage(workspaceId, pageId, userPrincipal.getId());
        return ResponseEntity.ok("hard deleted");
    }
    
    @PostMapping("/trash/{pageId}/restore")
    @Operation(summary = "Restore deleted page")
    public ResponseEntity<PageResponse> restorePage(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        PageResponse restoredPage = pageService.restorePage(workspaceId, pageId, userPrincipal.getId());
        return ResponseEntity.ok(restoredPage);
    }
    
    @PutMapping("/{pageId}/tags")
    @Operation(summary = "Update page tags")
    public ResponseEntity<String> updatePageTags(
            @PathVariable Long workspaceId,
            @PathVariable Long pageId,
            @RequestBody List<String> tags,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        pageService.updateTags(workspaceId, pageId, userPrincipal.getId(), tags);
        return ResponseEntity.ok("tags updated");
    }
    
} 
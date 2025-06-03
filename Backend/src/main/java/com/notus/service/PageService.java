package com.notus.service;

import com.notus.dto.page.PageRequest;
import com.notus.dto.page.PageResponse;
import com.notus.entity.Page;
import com.notus.entity.Workspace;
import com.notus.exception.ResourceNotFoundException;
import com.notus.exception.BadRequestException;
import com.notus.repository.PageRepository;
import com.notus.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageService {

	private final PageRepository pageRepository;
	private final WorkspaceRepository workspaceRepository;

	@Transactional
	public PageResponse createPage(Long workspaceId, PageRequest request, Long userId) {
		Workspace workspace = workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		Page page = new Page();
		page.setTitle(request.getTitle());
		page.setContent(request.getContent());
		page.setIconUrl(request.getIconUrl());
		page.setWorkspace(workspace);

		if (request.getParentId() != null) {
			Page parent = pageRepository.findActivePageByIdAndWorkspaceId(request.getParentId(), workspaceId)
					.orElseThrow(() -> new ResourceNotFoundException("Page", "id", request.getParentId()));

			// Check for circular reference
			if (isCircularReference(parent, request.getParentId())) {
				throw new BadRequestException("Circular reference detected in page hierarchy");
			}
			page.setParent(parent);
		}

		if (request.getSortOrder() != null) {
			page.setSortOrder(request.getSortOrder());
		} else {
			Integer maxSortOrder = pageRepository.findMaxSortOrderByWorkspaceAndParent(workspaceId,
					request.getParentId());
			page.setSortOrder(maxSortOrder != null ? maxSortOrder + 1 : 0);
		}

		page = pageRepository.save(page);
		return mapToResponse(page, true);
	}

	@Transactional(readOnly = true)
	public List<PageResponse> getRootPages(Long workspaceId, Long userId) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		return pageRepository.findRootPagesByWorkspaceId(workspaceId).stream().map(page -> mapToResponse(page, true))
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<PageResponse> getChildPages(Long workspaceId, Long parentId, Long userId) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		// Verify parent page exists
		pageRepository.findActivePageByIdAndWorkspaceId(parentId, workspaceId)
				.orElseThrow(() -> new ResourceNotFoundException("Page", "id", parentId));

		return pageRepository.findChildrenByParentId(parentId).stream().map(page -> mapToResponse(page, true))
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public PageResponse getPage(Long workspaceId, Long pageId, Long userId) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		Page page = pageRepository.findActivePageByIdAndWorkspaceId(pageId, workspaceId)
				.orElseThrow(() -> new ResourceNotFoundException("Page", "id", pageId));

		return mapToResponse(page, true);
	}

	@Transactional
	public PageResponse updatePage(Long workspaceId, Long pageId, PageRequest request, Long userId) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		Page page = pageRepository.findActivePageByIdAndWorkspaceId(pageId, workspaceId)
				.orElseThrow(() -> new ResourceNotFoundException("Page", "id", pageId));

		page.setTitle(request.getTitle());
		page.setContent(request.getContent());
		page.setIconUrl(request.getIconUrl());

		if (request.getParentId() != null
				&& !request.getParentId().equals(page.getParent() != null ? page.getParent().getId() : null)) {
			if (request.getParentId().equals(pageId)) {
				throw new BadRequestException("A page cannot be its own parent");
			}

			Page newParent = pageRepository.findActivePageByIdAndWorkspaceId(request.getParentId(), workspaceId)
					.orElseThrow(() -> new ResourceNotFoundException("Page", "id", request.getParentId()));

			// Check for circular reference
			if (isCircularReference(newParent, pageId)) {
				throw new BadRequestException("Circular reference detected in page hierarchy");
			}

			page.setParent(newParent);
		}

		if (request.getSortOrder() != null) {
			page.setSortOrder(request.getSortOrder());
		}

		page = pageRepository.save(page);
		return mapToResponse(page, true);
	}

	@Transactional
	public void deletePage(Long workspaceId, Long pageId, Long userId) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, userId)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		Page page = pageRepository.findActivePageByIdAndWorkspaceId(pageId, workspaceId)
				.orElseThrow(() -> new ResourceNotFoundException("Page", "id", pageId));

		softDeletePageAndChildren(page);
	}

	private void softDeletePageAndChildren(Page page) {
		page.setDeletedAt(LocalDateTime.now());
		pageRepository.save(page);

		page.getChildren().forEach(this::softDeletePageAndChildren);
	}

	private boolean isCircularReference(Page parent, Long targetPageId) {
		while (parent != null) {
			if (parent.getId().equals(targetPageId)) {
				return true;
			}
			parent = parent.getParent();
		}
		return false;
	}

	private PageResponse mapToResponse(Page page, boolean includeChildren) {
		List<PageResponse> children = includeChildren
				? page.getChildren().stream().filter(child -> child.getDeletedAt() == null)
						.map(child -> mapToResponse(child, false)).collect(Collectors.toList())
				: null;

		return PageResponse.builder().id(page.getId()).title(page.getTitle()).content(page.getContent())
				.iconUrl(page.getIconUrl()).workspaceId(page.getWorkspace().getId())
				.parentId(page.getParent() != null ? page.getParent().getId() : null).children(children)
				.sortOrder(page.getSortOrder())
				.childCount((int) page.getChildren().stream().filter(child -> child.getDeletedAt() == null).count())
				.createdAt(page.getCreatedAt()).updatedAt(page.getUpdatedAt()).bookmarked(page.isBookmarked())
				.createdBy(page.getWorkspace().getOwner().getId()).tags(page.getTags()).build();
	}

	public void toggleBookmark(Long workspaceId, Long pageId, Long id, boolean bookmarked) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, id)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		Page page = pageRepository.findActivePageByIdAndWorkspaceId(pageId, workspaceId)
				.orElseThrow(() -> new ResourceNotFoundException("Page", "id", pageId));

		page.setBookmarked(bookmarked);

		pageRepository.save(page);
	}

	public List<PageResponse> getAllPagesByUser(Long userId) {

		List<Page> pages = pageRepository.findAllByWorkspaceOwnerId(userId);

		return pages.stream().map(page -> mapToResponse(page, false)).collect(Collectors.toList());
	}

	public List<PageResponse> getDeletedPages(Long workspaceId, Long id) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, id)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		return pageRepository.findSoftDeletedRootPagesByWorkspaceId(workspaceId).stream()
				.map(page -> mapToResponse(page, true)).collect(Collectors.toList());
	}

	public void hardDeletePage(Long workspaceId, Long pageId, Long id) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, id)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		pageRepository.deleteById(pageId);

	}

	public void updateTags(Long workspaceId, Long pageId, Long id, List<String> tags) {
		workspaceRepository.findActiveWorkspaceByIdAndUserId(workspaceId, id)
				.orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

		Page page = pageRepository.findActivePageByIdAndWorkspaceId(pageId, workspaceId)
				.orElseThrow(() -> new ResourceNotFoundException("Page", "id", pageId));
		page.setTags(tags);
		page = pageRepository.save(page);
	}
	
	public PageResponse getPageForTags(Long pageId){
		Page page = pageRepository.findActivePageByIdAndWorkspaceId(pageId)
				.orElseThrow(() -> new ResourceNotFoundException("Page", "id", pageId));

		return mapToResponse(page, false);
	}

}
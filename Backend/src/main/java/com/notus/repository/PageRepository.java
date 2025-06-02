package com.notus.repository;

import com.notus.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {
    @Query("SELECT p FROM Page p WHERE p.workspace.id = :workspaceId AND p.parent IS NULL AND p.deletedAt IS NULL ORDER BY p.sortOrder")
    List<Page> findRootPagesByWorkspaceId(Long workspaceId);
    
    @Query("SELECT p FROM Page p WHERE p.parent.id = :parentId AND p.deletedAt IS NULL ORDER BY p.sortOrder")
    List<Page> findChildrenByParentId(Long parentId);
    
    @Query("SELECT p FROM Page p WHERE p.id = :pageId AND p.workspace.id = :workspaceId AND p.deletedAt IS NULL")
    Optional<Page> findActivePageByIdAndWorkspaceId(Long pageId, Long workspaceId);
    
    @Query("SELECT MAX(p.sortOrder) FROM Page p WHERE p.workspace.id = :workspaceId AND p.parent.id = :parentId AND p.deletedAt IS NULL")
    Integer findMaxSortOrderByWorkspaceAndParent(Long workspaceId, Long parentId);

	List<Page> findAllByWorkspaceOwnerId(Long userId);
	
	@Query("SELECT p FROM Page p WHERE p.workspace.id = :workspaceId AND p.parent IS NULL AND p.deletedAt IS NOT NULL ORDER BY p.sortOrder")
    List<Page> findSoftDeletedRootPagesByWorkspaceId(Long workspaceId);
	
	 @Query("SELECT p FROM Page p WHERE p.id = :pageId AND p.workspace.id = :workspaceId AND p.deletedAt IS NOT NULL")
	Optional<Page> findSoftDeletedPageByIdAndWorkspaceId(Long pageId, Long workspaceId);
} 
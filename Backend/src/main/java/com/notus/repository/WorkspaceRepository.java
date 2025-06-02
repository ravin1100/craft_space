package com.notus.repository;

import com.notus.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    @Query("SELECT w FROM Workspace w WHERE w.owner.id = :userId AND w.deletedAt IS NULL")
    List<Workspace> findActiveWorkspacesByUserId(Long userId);
    
    @Query("SELECT w FROM Workspace w WHERE w.id = :workspaceId AND w.owner.id = :userId AND w.deletedAt IS NULL")
    Optional<Workspace> findActiveWorkspaceByIdAndUserId(Long workspaceId, Long userId);
    
    boolean existsByNameAndOwnerIdAndDeletedAtIsNull(String name, Long ownerId);
} 
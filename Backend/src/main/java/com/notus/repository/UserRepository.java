package com.notus.repository;

import com.notus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT COUNT(w) FROM User u JOIN u.workspaces w WHERE u.id = :userId AND w.deletedAt IS NULL")
    long countActiveWorkspaces(Long userId);
} 
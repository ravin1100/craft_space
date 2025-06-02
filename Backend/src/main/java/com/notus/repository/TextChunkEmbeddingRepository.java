package com.notus.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.notus.entity.TextChunkEmbedding;

public interface TextChunkEmbeddingRepository extends JpaRepository<TextChunkEmbedding, Long>, TextChunkEmbeddingRepositoryCustom  {

//	@Query(value = """
//    SELECT * FROM chunk_embedding
//    WHERE (:sourceId IS NULL OR source = :sourceId)
//    ORDER BY vector <-> CAST(:vector AS vector)
//    LIMIT 3
//""", nativeQuery = true)
//List<ChunkEmbedding> findSimilar(@Param("vector") String vector, @Param("sourceId") String sourceId);

	
}

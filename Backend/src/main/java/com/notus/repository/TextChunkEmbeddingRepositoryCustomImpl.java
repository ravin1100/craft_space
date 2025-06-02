package com.notus.repository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import com.notus.entity.TextChunkEmbedding;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

public class TextChunkEmbeddingRepositoryCustomImpl implements TextChunkEmbeddingRepositoryCustom{
	
	 @PersistenceContext
	    private EntityManager entityManager;
	    
	    @Autowired private JdbcTemplate jdbcTemplate;


	    @Override
	    public List<TextChunkEmbedding> findSimilarByVector(List<Double> vector, Long sourceId) {
	        String vectorString = vector.stream()
	                .map(String::valueOf)
	                .collect(Collectors.joining(", ", "[", "]"));

	        // Important: Move ::vector *inside* the SQL string literal
	        String sql = "SELECT * FROM text_chunk_embedding " +
	                "WHERE (:sourceId IS NULL OR source_id = :sourceId) " +
	                "ORDER BY vector <-> CAST(:vectorStr AS vector) " +
	                "LIMIT 3";

	   Query query = entityManager.createNativeQuery(sql, TextChunkEmbedding.class);
	   query.setParameter("sourceId", sourceId);
	   query.setParameter("vectorStr", vectorString);


	        @SuppressWarnings("unchecked")
	        List<TextChunkEmbedding> results = query.getResultList();
	        return results;
	    }
	    
	    public List<String> findAllUniqueSourceIds() {
	        String sql = "SELECT DISTINCT source FROM chunk_embedding";
	        return jdbcTemplate.queryForList(sql, String.class);
	    }

}

package com.notus.repository;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import com.notus.entity.TextChunkEmbedding;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

public class TextChunkEmbeddingRepositoryCustomImpl implements TextChunkEmbeddingRepositoryCustom {

	@PersistenceContext
	private EntityManager entityManager;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Override
	@SuppressWarnings("unchecked")
	public List<TextChunkEmbedding> findSimilarByVector(List<Double> vector, Long sourceId) {
		String vectorString = vector.stream().map(String::valueOf).collect(Collectors.joining(", ", "[", "]"));

		// Important: Move ::vector *inside* the SQL string literal
		String sql = "SELECT * FROM text_chunk_embedding " + "WHERE (:sourceId IS NULL OR source_id = :sourceId) "
				+ "ORDER BY vector <-> CAST(:vectorStr AS vector) " + "LIMIT 3";

		Query query = entityManager.createNativeQuery(sql, TextChunkEmbedding.class);
		query.setParameter("sourceId", sourceId);
		query.setParameter("vectorStr", vectorString);

		List<TextChunkEmbedding> results = query.getResultList();
		return results;
	}
	
	@Override
	@SuppressWarnings("unchecked")
	public List<TextChunkEmbedding> findSimilarByVectorInPage(List<Double> vector, Long pageId) {
		String vectorString = vector.stream().map(String::valueOf).collect(Collectors.joining(", ", "[", "]"));
		
		String selectQuery = """
			    SELECT * FROM text_chunk_embedding
			    WHERE (:pageId IS NULL OR page_id = :pageId)
			    ORDER BY vector <-> CAST(:vectorString AS vector)
			    LIMIT 3
			    """;

		Query query = entityManager.createNativeQuery(selectQuery, TextChunkEmbedding.class);
		query.setParameter("pageId", pageId);
		query.setParameter("vectorString", vectorString);

		List<TextChunkEmbedding> results = query.getResultList();
		return results;
	}

	@Override
	@SuppressWarnings("unchecked")
	public List<TextChunkEmbedding> findEmbeddingsOfPage(Long sourceId, Long pageId) {
		String sql = "SELECT * FROM text_chunk_embedding " + "WHERE source_id = :sourceId AND page_id = :pageId";

		Query query = entityManager.createNativeQuery(sql, TextChunkEmbedding.class);
		query.setParameter("sourceId", sourceId);
		query.setParameter("pageId", pageId);

		return query.getResultList();
	}

	@Override
	@SuppressWarnings("unchecked")
	public List<TextChunkEmbedding> findByWorkSpaceId(Long workspaceId) {
		String sql = "SELECT * FROM text_chunk_embedding " + "WHERE work_space_id = :workspaceId";

		Query query = entityManager.createNativeQuery(sql, TextChunkEmbedding.class);
		query.setParameter("workspaceId", workspaceId);

		return query.getResultList();
	}

}

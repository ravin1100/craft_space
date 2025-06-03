package com.notus.repository;

import java.util.List;

import com.notus.entity.TextChunkEmbedding;

public interface TextChunkEmbeddingRepositoryCustom {
	
	List<TextChunkEmbedding> findSimilarByVector(List<Double> vector, Long sourceId);

	List<TextChunkEmbedding> findEmbeddingsOfPage(Long sourceId, Long pageId);
	
}

package com.notus.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.notus.dto.page.PageResponse;
import com.notus.entity.User;

@Component
public class DocumentUploadService {

	@Autowired
	private TextChunker chunker;
	
	@Autowired
	private EmbeddingService embeddingService;
	
	@Autowired
	private JdbcTemplate jdbcTemplate;
	
	@Autowired
	private PageService pageService;

	public void processAndStore(User user) {
		List<PageResponse> pages = pageService.getAllPagesByUser(user.getId());

		//delete existing entries with the same sourceId
		String deleteSql = "DELETE FROM text_chunk_embedding WHERE source_id = ?";
		jdbcTemplate.update(deleteSql, user.getId());

		for (PageResponse info : pages) {
			Long workSpaceId = info.getWorkspaceId();
			Long pageId = info.getId();
			
			List<String> chunks = chunker.chunkText(info.getContent(), 500);

			for (String chunk : chunks) {
				List<Double> vector = embeddingService.getEmbedding(chunk);

				// Convert list to pgvector format string: "[0.1, 0.2, 0.3]"
				String pgVectorFormat = vector.stream().map(String::valueOf).collect(Collectors.joining(",", "[", "]"));

				// Use native SQL with ::vector cast
				String inserSqlQuery = "INSERT INTO text_chunk_embedding (chunk_text, source_id, vector, work_space_id, page_id) VALUES (?, ?, ?::vector, ?, ? )";
				jdbcTemplate.update(inserSqlQuery, chunk, user.getId(), pgVectorFormat, workSpaceId, pageId);
			}
		}
	}

}

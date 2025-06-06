package com.notus.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.notus.dto.page.PageResponse;
import com.notus.entity.TextChunkEmbedding;
import com.notus.entity.User;
import com.notus.repository.TextChunkEmbeddingRepository;

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

	@Autowired
	private GeminiService geminiService;

	@Autowired
	private TextChunkEmbeddingRepository repository;


	public void processAndStore(User user) {

		List<PageResponse> pages = pageService.getAllPagesByUser(user.getId());

		// Delete existing entries for the user
		String deleteSql = "DELETE FROM text_chunk_embedding WHERE source_id = ?";
		jdbcTemplate.update(deleteSql, user.getId());

		for (PageResponse info : pages) {
			try {

				// Chunk the summary
				List<String> chunks = chunker.chunkText(info.getTextContent(), 500);
				List<Object[]> batchParams = new ArrayList<>();

				for (String chunk : chunks) {
					List<Double> vector = embeddingService.getEmbedding(chunk);
					String pgVectorFormat = vector.stream().map(String::valueOf)
							.collect(Collectors.joining(",", "[", "]"));

					batchParams.add(new Object[] { chunk, user.getId(), pgVectorFormat, info.getWorkspaceId(), info.getId() });
				}

				// Insert chunk embeddings for this page
				String sql = "INSERT INTO text_chunk_embedding (chunk_text, source_id, vector, work_space_id, page_id) VALUES (?, ?, ?::vector, ?, ?)";
				jdbcTemplate.batchUpdate(sql, batchParams);

			} catch (Exception e) {
				e.printStackTrace(); // Log the error with context if needed
			}
		}
	}

	public String processAndStoreForTags(User user, Long pageId, boolean tag) throws IOException {
		PageResponse info = pageService.getPageForTags(pageId);

		// Delete existing entries of the current user
		String deleteSql = "DELETE FROM text_chunk_embedding WHERE source_id = ? and page_id = ?";
		jdbcTemplate.update(deleteSql, user.getId(), pageId);

		Long workSpaceId = info.getWorkspaceId();
		List<String> chunks = chunker.chunkText(info.getTextContent(), 500);

		StringBuilder context = new StringBuilder("Context:\n");
		for (String chunk : chunks) {
			List<Double> vector = embeddingService.getEmbedding(chunk);

			// Convert list to pgvector format string: "[0.1, 0.2, 0.3]"
			String pgVectorFormat = vector.stream().map(String::valueOf).collect(Collectors.joining(",", "[", "]"));
			// Use native SQL with ::vector cast
			String inserSqlQuery = "INSERT INTO text_chunk_embedding (chunk_text, source_id, vector, work_space_id, page_id) VALUES (?, ?, ?::vector, ?, ? )";
			jdbcTemplate.update(inserSqlQuery, chunk, user.getId(), pgVectorFormat, workSpaceId, pageId);

		}
		String tagPrompt = "";
		String summaryPrompt = "";
		List<Double> queryVector;
		if (tag == true) {
			tagPrompt = "Based on the following content, generate 3 to 5 relevant and concise tags that best describe the main topics or themes. Avoid long phrases. Only return the tags as a comma-separated list.";
			queryVector = embeddingService.getEmbedding(tagPrompt);
		} else {
			summaryPrompt = "Based on the following content, write a concise summary capturing the main ideas or themes. Keep it short and informative (2-4 sentences)";
			queryVector = embeddingService.getEmbedding(summaryPrompt);
		}

		// Call the custom repository method
		List<TextChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, user.getId());
		// Call the custom repository method
//        List<TextChunkEmbedding> pageChunks = repository.findEmbeddingsOfPage(user.getId(), pageId);

		// 3. Build context from those chunks
		for (int i = 0; i < topChunks.size(); i++) {
			context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
		}

		String answer = geminiService
				.ask((tag == true) ? context.append(tagPrompt).toString() : context.append(summaryPrompt).toString());
		return answer;
	}

}

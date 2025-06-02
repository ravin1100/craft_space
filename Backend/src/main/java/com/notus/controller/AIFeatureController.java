package com.notus.controller;


import java.io.IOException;
import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.notus.dto.request.QueryRequest;
import com.notus.entity.TextChunkEmbedding;
import com.notus.entity.User;
import com.notus.repository.TextChunkEmbeddingRepository;
import com.notus.service.ContextService;
import com.notus.service.DocumentUploadService;
import com.notus.service.EmbeddingService;
import com.notus.service.GeminiService;


@RestController
@RequestMapping("/api/ai")
public class AIFeatureController {

	@Autowired
	private GeminiService geminiService;
	
    @Autowired 
    private DocumentUploadService chunkStorageService;
    
    @Autowired 
    private EmbeddingService embeddingService;
    
    @Autowired
    private TextChunkEmbeddingRepository repository;
    
    @Autowired
    private ContextService ContextService;
    
    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument() throws BadRequestException {
        // fallback to UUID if no sourceId provided
    	User currentUser = ContextService.getCurrentUser();
    	
    	if(currentUser == null) {
    		throw new BadRequestException("Something Went Wrong !");
    	}
        chunkStorageService.processAndStore(currentUser);
        return ResponseEntity.ok("Document processed and stored successfully with source: " + currentUser.getName());
    }
    
    @PostMapping("/query")
    public ResponseEntity<String> handleQuery(@RequestBody QueryRequest request) throws IOException {
    	
    	User currentUser = ContextService.getCurrentUser();
    	Long source = currentUser.getId();
    	
    	// 1. Get vector for query using Python service
        List<Double> queryVector = embeddingService.getEmbedding(request.getQuestion());

        // Call the custom repository method
        List<TextChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, source);

        // 3. Build context from those chunks
        StringBuilder context = new StringBuilder("Context:\n");
        for (int i = 0; i < topChunks.size(); i++) {
            context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
        }

        context.append("User Question: ").append(request.getQuestion());

        // 4. Call Gemini service
        String answer = geminiService.ask(context.toString());

        return ResponseEntity.ok(answer);
    }
}

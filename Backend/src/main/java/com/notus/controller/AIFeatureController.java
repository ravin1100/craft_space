package com.notus.controller;


import java.io.IOException;
import java.util.List;

import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.notus.dto.KnowledgeGraphResponse;
import com.notus.dto.request.QueryRequest;
import com.notus.entity.TextChunkEmbedding;
import com.notus.entity.User;
import com.notus.repository.TextChunkEmbeddingRepository;
import com.notus.service.ContextService;
import com.notus.service.DocumentUploadService;
import com.notus.service.EmbeddingService;
import com.notus.service.GeminiService;
import com.notus.service.KnowledgeGraphBuilderService;


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
    
    @Autowired
    private KnowledgeGraphBuilderService graphService;
    
    @PostMapping("/upload")
    public ResponseEntity<String> uploadDocument() throws BadRequestException {
    	User currentUser = ContextService.getCurrentUser();
        chunkStorageService.processAndStore(currentUser);
        return ResponseEntity.ok("Content stored successfully with source: " + currentUser.getName());
    }
    
    @PostMapping("/query")
    public ResponseEntity<String> handleQuery(@RequestBody QueryRequest request) throws IOException {
    	
    	User currentUser = ContextService.getCurrentUser();
    	Long source = currentUser.getId();
    	
    	// Embedding Service
        List<Double> queryVector = embeddingService.getEmbedding(request.getQuestion());

        // Call the custom repository method
        List<TextChunkEmbedding> topChunks = repository.findSimilarByVector(queryVector, source);

        // Build context from those text chunks
        StringBuilder context = new StringBuilder("Context:\n");
        for (int i = 0; i < topChunks.size(); i++) {
            context.append(i + 1).append(". ").append(topChunks.get(i).getChunkText()).append("\n\n");
        }

        context.append("User Question: ").append(request.getQuestion()).append("\n");
        context.append("Instructions:\n");
        context.append("- Base your answer only on the context provided.\n");
        
        String answer = geminiService.ask(context.toString());

        return ResponseEntity.ok(answer);
    }
    
    @GetMapping("/upload/{pageId}/tag")
    public ResponseEntity<String> uploadDocumentForTags(@PathVariable Long pageId) throws IOException {
    	User currentUser = ContextService.getCurrentUser();
        return ResponseEntity.ok(chunkStorageService.processAndStoreForTags(currentUser, pageId, true));
    }
    
    @GetMapping("/upload/{pageId}/summary")
    public ResponseEntity<String> uploadDocumentForSummary(@PathVariable Long pageId) throws IOException {
    	User currentUser = ContextService.getCurrentUser();
        return ResponseEntity.ok(chunkStorageService.processAndStoreForTags(currentUser, pageId, false));
    }
    
    @GetMapping("/graph")
    public KnowledgeGraphResponse getGraph(@RequestParam Long workspaceId,
                                           @RequestParam(defaultValue = "0.2") double threshold) {
        return graphService.buildGraph(workspaceId, threshold);
    }
}

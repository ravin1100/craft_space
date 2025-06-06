package com.notus.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.notus.dto.GraphEdge;
import com.notus.dto.GraphNode;
import com.notus.dto.KnowledgeGraphResponse;
import com.notus.entity.Page;
import com.notus.entity.TextChunkEmbedding;
import com.notus.repository.PageRepository;
import com.notus.repository.TextChunkEmbeddingRepository;

@Service
public class KnowledgeGraphBuilderService {

    @Autowired
    private TextChunkEmbeddingRepository chunkRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private PageRepository pageRepository; // if you want labels (titles)

    public KnowledgeGraphResponse buildGraph(Long workSpaceId, double threshold) {
    	 List<TextChunkEmbedding> chunks = chunkRepository.findByWorkSpaceId(workSpaceId);

         Map<Long, String> pageTitles = pageRepository.findRootPagesByWorkspaceId(workSpaceId).stream()
             .collect(Collectors.toMap(Page::getId, Page::getTitle));

         // Build unique nodes based on pageId
         Set<Long> uniquePageIds = chunks.stream()
             .map(TextChunkEmbedding::getPageId)
             .collect(Collectors.toSet());

         List<GraphNode> nodes = uniquePageIds.stream()
             .map(pageId -> new GraphNode(pageId, pageTitles.getOrDefault(pageId, "Page " + pageId)))
             .collect(Collectors.toList());

         // Build edge map: key = "minId_maxId", value = list of scores
         Map<String, List<Double>> edgeScoresMap = new HashMap<>();

         for (int i = 0; i < chunks.size(); i++) {
             TextChunkEmbedding a = chunks.get(i);
             double[] vecA = embeddingService.convertStringToDoubleVector(a.getVector());

             for (int j = i + 1; j < chunks.size(); j++) {
                 TextChunkEmbedding b = chunks.get(j);
                 if (a.getPageId().equals(b.getPageId())) continue;

                 double[] vecB = embeddingService.convertStringToDoubleVector(b.getVector());
                 double score = cosineSimilarity(vecA, vecB);

                 if (score >= threshold && score > 0) {
                     Long from = Math.min(a.getPageId(), b.getPageId());
                     Long to = Math.max(a.getPageId(), b.getPageId());
                     String key = from + "_" + to;
                     edgeScoresMap.computeIfAbsent(key, k -> new ArrayList<>()).add(score);
                 }
             }
         }

         // Aggregate edge scores
         List<GraphEdge> edges = edgeScoresMap.entrySet().stream()
             .map(entry -> {
                 String[] parts = entry.getKey().split("_");
                 Long from = Long.parseLong(parts[0]);
                 Long to = Long.parseLong(parts[1]);
                 List<Double> scores = entry.getValue();
                 double avgScore = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                 return new GraphEdge(from, to, avgScore);
             })
             .collect(Collectors.toList());

         return new KnowledgeGraphResponse(nodes, edges);
    }
    
    private double cosineSimilarity(double[] a, double[] b) {
        double dot = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}


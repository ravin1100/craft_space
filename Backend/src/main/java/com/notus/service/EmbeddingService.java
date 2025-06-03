package com.notus.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class EmbeddingService {

	 private final RestTemplate restTemplate = new RestTemplate();

	    public List<Double> getEmbedding(String text) {
//	        String url = "http://localhost:8000/embed";
	        String url = "http://3.110.185.119:8001/embed";
	        Map<String, Object> request = Map.of("texts", List.of(text));

	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_JSON);
	        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

	        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
	        List<List<Double>> embeddings = (List<List<Double>>) response.getBody().get("embeddings");

	        return embeddings.get(0); // First vector
	    }
	
}

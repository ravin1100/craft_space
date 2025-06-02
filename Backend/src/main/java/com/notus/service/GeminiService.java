package com.notus.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Component
public class GeminiService {
	
	  @Value("${gemini.api.key}")
	    private String apiKey;

	    private static final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
	                                          
	    public String ask(String prompt) throws IOException {
	        OkHttpClient client = new OkHttpClient();
	        ObjectMapper mapper = new ObjectMapper();

	        // Gemini expects this format:
	        Map<String, Object> requestBody = Map.of(
	            "contents", new Object[]{
	                Map.of(
	                    "parts", new Object[]{
	                        Map.of("text", prompt)
	                    }
	                )
	            }
	        );

	        RequestBody body = RequestBody.create(
	            mapper.writeValueAsString(requestBody),
	            MediaType.parse("application/json")
	        );

	        HttpUrl url = HttpUrl.parse(API_URL).newBuilder()
	                .addQueryParameter("key", apiKey)
	                .build();

	        Request request = new Request.Builder()
	                .url(url)
	                .post(body)
	                .build();

	        try (Response response = client.newCall(request).execute()) {
	            String responseBody = response.body().string();
	            JsonNode root = mapper.readTree(responseBody);
	            JsonNode candidates = root.path("candidates");

	            if (candidates.isArray() && candidates.size() > 0) {
	                return candidates.get(0).path("content").path("parts").get(0).path("text").asText();
	            } else {
//	                throw new BadRequestException("Invalid Gemini response: no candidates");
	                return "";
	            }
	        }
	    }

}

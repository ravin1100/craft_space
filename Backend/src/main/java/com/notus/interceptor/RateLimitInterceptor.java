package com.notus.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
//import com.notus.config.RateLimitConfig;
import com.notus.dto.error.ApiError;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

//@Component
//@RequiredArgsConstructor
//public class RateLimitInterceptor implements HandlerInterceptor {
//
//    private final RateLimitConfig rateLimitConfig;
//    private final ObjectMapper objectMapper;
//
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//        String key = resolveKey(request);
//        Bucket bucket = rateLimitConfig.resolveBucket(key);
//
//        if (!bucket.tryConsume(1)) {
//            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
//            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//
//            ApiError error = ApiError.of(
//                HttpStatus.TOO_MANY_REQUESTS,
//                "Rate limit exceeded. Please try again later.",
//                new RuntimeException("Too many requests")
//            );
//
//            objectMapper.writeValue(response.getWriter(), error);
//            return false;
//        }
//
//        return true;
//    }
//
//    private String resolveKey(HttpServletRequest request) {
//        String ip = request.getRemoteAddr();
//        String path = request.getRequestURI();
//        return ip + ":" + path;
//    }
//} 
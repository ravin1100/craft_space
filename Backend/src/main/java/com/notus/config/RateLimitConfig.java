package com.notus.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

//@Configuration
//public class RateLimitConfig {
//    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
//
//    public Bucket resolveBucket(String key) {
//        return buckets.computeIfAbsent(key, this::newBucket);
//    }
//
//    private Bucket newBucket(String key) {
//        return Bucket.builder()
//                .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
//                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofSeconds(1))))
//                .build();
//    }
//} 
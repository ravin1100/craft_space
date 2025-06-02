package com.notus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CraftSpaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CraftSpaceApplication.class, args);
    }
} 
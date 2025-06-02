//package com.notus.config;
//
//import org.springframework.boot.test.context.TestConfiguration;
//import org.springframework.context.annotation.Bean;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.testcontainers.containers.PostgreSQLContainer;
//import org.testcontainers.utility.DockerImageName;
//
//@TestConfiguration
//public class TestConfig {
//
//    @Bean
//    public PostgreSQLContainer<?> postgreSQLContainer() {
//        PostgreSQLContainer<?> container = new PostgreSQLContainer<>(DockerImageName.parse("postgres:15-alpine"))
//                .withDatabaseName("testdb")
//                .withUsername("test")
//                .withPassword("test");
//        container.start();
//        return container;
//    }
//
//    @Bean
//    public PasswordEncoder testPasswordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//} 
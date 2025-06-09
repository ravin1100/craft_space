package com.notus.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
       
        // Set the allow credentials flag to true
//        config.setAllowCredentials(true);

        // You can manually add your origins here
        // Dynamically allow all origins
        config.addAllowedOriginPattern("http://*"); // Matches all origins with http://
        config.addAllowedOriginPattern("https://*"); // Matches all origins with https://

//        config.setAllowedOrigins(List.of("*"));
        config.setAllowedMethods(List.of("*"));
        config.addAllowedHeader("*"); // Allow all headers
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
    
    
}

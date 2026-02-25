package com.example.permitly2.permitly.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve files from ./uploads/teachers as /teachers/**
        Path uploadDir = Path.of("uploads", "teachers").toAbsolutePath().normalize();

        registry.addResourceHandler("/teachers/**")
                .addResourceLocations(uploadDir.toUri().toString());
    }
}
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
        Path teachersDir = Path.of("uploads", "teachers").toAbsolutePath().normalize();

        registry.addResourceHandler("/teachers/**")
                .addResourceLocations("file:" + teachersDir.toString() + "/");

        // Serve files from ./uploads as /uploads/** for student proofs
        Path uploadsDir = Path.of("uploads").toAbsolutePath().normalize();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsDir.toString() + "/");
    }
}
package com.example.permitly2.permitly.controller;

import com.example.permitly2.permitly.entity.TeacherPersona;
import com.example.permitly2.permitly.repository.TeacherPersonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher/personas")
@RequiredArgsConstructor
public class TeacherPersonaController {

    private final TeacherPersonaRepository repo;

    @GetMapping
    public List<TeacherPersona> getActivePersonas() {
        return repo.findByIsActiveTrue();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TeacherPersona createPersona(
            @RequestPart("name") String name,
            @RequestPart("photo") MultipartFile photo
    ) throws IOException {

        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (photo == null || photo.isEmpty()) {
            throw new IllegalArgumentException("Photo is required");
        }

        // Ensure directory exists
        Path uploadDir = Path.of("uploads", "teachers");
        Files.createDirectories(uploadDir);

        // Build safe filename
        String original = StringUtils.cleanPath(photo.getOriginalFilename() == null ? "photo" : photo.getOriginalFilename());
        String ext = "";

        int dot = original.lastIndexOf(".");
        if (dot >= 0) ext = original.substring(dot); // includes ".png"

        String filename = UUID.randomUUID() + ext;
        Path target = uploadDir.resolve(filename);

        // Save file
        Files.copy(photo.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // URL accessible by frontend
        String photoUrl = "/teachers/" + filename;

        TeacherPersona persona = TeacherPersona.builder()
                .name(name.trim())
                .photoUrl(photoUrl)
                .isActive(true)
                .build();

        return repo.save(persona);
    }
}
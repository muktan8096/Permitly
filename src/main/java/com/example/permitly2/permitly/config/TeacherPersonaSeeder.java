package com.example.permitly2.permitly.config;

import com.example.permitly2.permitly.entity.TeacherPersona;
import com.example.permitly2.permitly.repository.TeacherPersonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TeacherPersonaSeeder implements CommandLineRunner {

    private final TeacherPersonaRepository repo;

    @Override
    public void run(String... args) {
        // Only seed if table is empty (prevents duplicate inserts)
        if (repo.count() > 0) return;

        List<TeacherPersona> personas = List.of(
                TeacherPersona.builder().name("山田先生").photoUrl("/teachers/yamada.png").isActive(true).build(),
                TeacherPersona.builder().name("田中先生").photoUrl("/teachers/tanaka.png").isActive(true).build(),
                TeacherPersona.builder().name("佐藤先生").photoUrl("/teachers/sato.png").isActive(true).build()
        );

        repo.saveAll(personas);
        System.out.println("✅ Seeded teacher personas: " + personas.size());
    }
}

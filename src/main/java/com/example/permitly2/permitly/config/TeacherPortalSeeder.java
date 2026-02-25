package com.example.permitly2.permitly.config;

import com.example.permitly2.permitly.entity.Role;
import com.example.permitly2.permitly.entity.User;
import com.example.permitly2.permitly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TeacherPortalSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    // ✅ change these to whatever you want
    private static final String TEACHER_PORTAL_EMAIL = "teacher@school.jp";
    private static final String TEACHER_PORTAL_PASSWORD = "Teacher@1234"; // make it strong
    private static final String TEACHER_PORTAL_SCHOOL_ID = "TEACHER-PORTAL";

    @Override
    public void run(String... args) {

        // If teacher portal already exists, do nothing
        if (userRepo.existsByEmail(TEACHER_PORTAL_EMAIL)) return;

        User teacher = User.builder()
                .fullName("Teacher Portal")
                .schoolId(TEACHER_PORTAL_SCHOOL_ID)
                .email(TEACHER_PORTAL_EMAIL)
                .passwordHash(passwordEncoder.encode(TEACHER_PORTAL_PASSWORD))
                .role(Role.TEACHER)
                .mustChangePassword(false)
                .build();

        userRepo.save(teacher);

        System.out.println("✅ Seeded Teacher Portal account:");
        System.out.println("   email: " + TEACHER_PORTAL_EMAIL);
        System.out.println("   password: " + TEACHER_PORTAL_PASSWORD);
    }
}

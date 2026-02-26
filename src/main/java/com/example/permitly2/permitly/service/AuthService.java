package com.example.permitly2.permitly.service;

import com.example.permitly2.permitly.dto.ChangePasswordRequest;
import com.example.permitly2.permitly.dto.LoginRequest;
import com.example.permitly2.permitly.dto.LoginResponse;
import com.example.permitly2.permitly.dto.RegisterRequest;
import com.example.permitly2.permitly.entity.User;
import com.example.permitly2.permitly.repository.UserRepository;
import com.example.permitly2.permitly.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    // ===============================
    // Register: create user + temp password + email it
    // ===============================
    public void register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsBySchoolId(req.getSchoolId())) {
            throw new RuntimeException("School ID already exists");
        }

        String tempPassword = generateTempPassword(10);

        User user = User.builder()
                .fullName(req.getFullName())
                .schoolId(req.getSchoolId())
                .email(req.getEmail())
                .role(req.getRole())
                .passwordHash(passwordEncoder.encode(tempPassword))
                .mustChangePassword(true) // ✅ force change after first login
                .build();

        userRepository.save(user);

        // If email fails, show error (so user doesn't think it's sent)
        try {
            emailService.sendTempPassword(req.getEmail(), tempPassword);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email. Please try again.", e);
        }
    }

    // ===============================
    // Login: return token + mustChangePassword flag
    // ===============================
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean match = passwordEncoder.matches(req.getPassword(), user.getPasswordHash());
        if (!match)
            throw new RuntimeException("Invalid email or password");

        String jwtToken = jwtUtil.generateToken(user.getEmail());

        // ✅ frontend will redirect ONLY if this is true
        return new LoginResponse(
                jwtToken,
                user.isMustChangePassword(),
                user.getRole(), // ✅ send role back
                user.getFullName());
    }

    // ===============================
    // Change Password: set new password + turn off mustChangePassword
    // ===============================
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setMustChangePassword(false); // ✅ so next logins go to dashboard
        userRepository.save(user);
    }

    // ===============================
    // Temp Password Generator
    // ===============================
    private String generateTempPassword(int length) {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}

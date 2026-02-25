package com.example.permitly2.permitly.controller;

import com.example.permitly2.permitly.dto.ChangePasswordRequest;
import com.example.permitly2.permitly.dto.LoginRequest;
import com.example.permitly2.permitly.dto.LoginResponse;
import com.example.permitly2.permitly.dto.RegisterRequest;
import com.example.permitly2.permitly.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public void register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    // TEMP for now: in real life, we change password using logged-in token.
    // Next step we'll secure this properly.
    @PostMapping("/change-password")
    public void changePassword(@RequestParam String email, @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(email, req);
    }
}

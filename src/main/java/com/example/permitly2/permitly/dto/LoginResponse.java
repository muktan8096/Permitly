package com.example.permitly2.permitly.dto;

import com.example.permitly2.permitly.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private boolean mustChangePassword;
    private Role role;   // ✅ add this
}

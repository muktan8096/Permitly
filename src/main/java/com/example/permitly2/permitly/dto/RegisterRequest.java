package com.example.permitly2.permitly.dto;

import com.example.permitly2.permitly.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank private String fullName;
    @NotBlank private String schoolId;
    @Email @NotBlank private String email;
    @NotNull private Role role;
}

package com.example.permitly2.permitly.dto;

public record TeacherDecisionHistoryDTO(
        String requestId,
        String studentId,
        String studentName,
        String title,
        String status,
        String decidedByName
) {}


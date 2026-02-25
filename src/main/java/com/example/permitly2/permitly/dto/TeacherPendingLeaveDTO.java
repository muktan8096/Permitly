package com.example.permitly2.permitly.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record TeacherPendingLeaveDTO(
        String id,
        Long student_id,
        String student_full_name,
        String title,
        String type,
        LocalDate date,
        LocalTime start_time,
        LocalTime end_time,
        String reason,
        String proof_url,
        String status
) {}

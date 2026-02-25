package com.example.permitly2.permitly.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.Column;


@Entity
@Data
public class LeaveRequest {

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    private String type;

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String reason;

    private String proofUrl;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;

    @ManyToOne
    private User student;

    // Who made the final decision (teacher)
    @ManyToOne
    @JoinColumn(name = "decided_by_id")
    private User decidedBy;



    // When the decision was made
    private LocalDateTime decisionAt;
    // Who made the decision (teacher persona)
    private Long decidedByPersonaId;

    private String decidedByPersonaName;
}

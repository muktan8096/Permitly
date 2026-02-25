package com.example.permitly2.permitly.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "teacher_personas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherPersona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // ex: "山田先生"

    @Column(nullable = false)
    private String photoUrl; // ex: "/teachers/yamada.png"

    @Column(nullable = false)
    private boolean isActive = true;
}

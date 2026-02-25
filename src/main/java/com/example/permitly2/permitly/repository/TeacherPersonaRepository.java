package com.example.permitly2.permitly.repository;

import com.example.permitly2.permitly.entity.TeacherPersona;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherPersonaRepository extends JpaRepository<TeacherPersona, Long> {
    List<TeacherPersona> findByIsActiveTrue();
}

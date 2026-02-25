package com.example.permitly2.permitly.repository;

import com.example.permitly2.permitly.entity.LeaveRequest;
import com.example.permitly2.permitly.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, String> {

    List<LeaveRequest> findByStudent_Id(Long studentId);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    @Query("""
        SELECT lr
        FROM LeaveRequest lr
        JOIN FETCH lr.student s
        WHERE lr.status = :status
        ORDER BY lr.createdAt DESC
    """)
    List<LeaveRequest> findByStatusWithStudent(@Param("status") LeaveStatus status);

    @Query("""
        SELECT lr
        FROM LeaveRequest lr
        JOIN FETCH lr.student s
        LEFT JOIN FETCH lr.decidedBy d
        WHERE lr.status IN (:approved, :rejected)
        ORDER BY lr.decisionAt DESC
    """)
    List<LeaveRequest> findDecidedWithStudentAndTeacher(
            @Param("approved") LeaveStatus approved,
            @Param("rejected") LeaveStatus rejected
    );

    boolean existsByStudent_IdAndDateAndStartTimeAndEndTime(
            Long studentId,
            java.time.LocalDate date,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime
    );
}


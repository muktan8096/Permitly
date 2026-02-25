package com.example.permitly2.permitly.service;

import com.example.permitly2.permitly.dto.TeacherDecisionHistoryDTO;
import com.example.permitly2.permitly.dto.TeacherPendingLeaveDTO;
import com.example.permitly2.permitly.entity.LeaveRequest;
import com.example.permitly2.permitly.entity.LeaveStatus;
import com.example.permitly2.permitly.entity.TeacherPersona;
import com.example.permitly2.permitly.entity.User;
import com.example.permitly2.permitly.repository.LeaveRequestRepository;
import com.example.permitly2.permitly.repository.TeacherPersonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final TeacherPersonaRepository teacherPersonaRepository; // ✅ NEW

    public List<TeacherPendingLeaveDTO> getPendingForTeacher() {
        List<LeaveRequest> pending = leaveRequestRepository.findByStatusWithStudent(LeaveStatus.PENDING);

        return pending.stream()
                .map(lr -> new TeacherPendingLeaveDTO(
                        lr.getId(),
                        lr.getStudent() != null ? lr.getStudent().getId() : null,
                        lr.getStudent() != null ? lr.getStudent().getFullName() : null,
                        lr.getTitle(),
                        lr.getType(),
                        lr.getDate(),
                        lr.getStartTime(),
                        lr.getEndTime(),
                        lr.getReason(),
                        lr.getProofUrl(),
                        lr.getStatus() != null ? lr.getStatus().name() : null
                ))
                .toList();
    }

    // ✅ UPDATED: approve now takes personaId
    public LeaveRequest approve(String id, User teacher, Long teacherPersonaId) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        req.setStatus(LeaveStatus.APPROVED);
        req.setDecidedBy(teacher);
        req.setDecisionAt(LocalDateTime.now());

        // ✅ store persona data for history display
        applyPersona(req, teacherPersonaId);

        return leaveRequestRepository.save(req);
    }

    // ✅ UPDATED: reject now takes personaId
    public LeaveRequest reject(String id, User teacher, Long teacherPersonaId) {
        LeaveRequest req = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        req.setStatus(LeaveStatus.REJECTED);
        req.setDecidedBy(teacher);
        req.setDecisionAt(LocalDateTime.now());

        // ✅ store persona data for history display
        applyPersona(req, teacherPersonaId);

        return leaveRequestRepository.save(req);
    }

    private void applyPersona(LeaveRequest req, Long teacherPersonaId) {
        if (teacherPersonaId == null) return;

        TeacherPersona persona = teacherPersonaRepository.findById(teacherPersonaId)
                .orElseThrow(() -> new RuntimeException("Teacher persona not found"));

        req.setDecidedByPersonaId(persona.getId());
        req.setDecidedByPersonaName(persona.getName());
    }

    public List<TeacherDecisionHistoryDTO> getDecisionHistory() {
        List<LeaveRequest> decided = leaveRequestRepository.findDecidedWithStudentAndTeacher(
                LeaveStatus.APPROVED,
                LeaveStatus.REJECTED
        );

        return decided.stream()
                .map(lr -> new TeacherDecisionHistoryDTO(
                        lr.getId(),
                        lr.getStudent() != null ? lr.getStudent().getSchoolId() : null,
                        lr.getStudent() != null ? lr.getStudent().getFullName() : null,
                        lr.getTitle(),
                        lr.getStatus() != null ? lr.getStatus().name() : null,

                        // ✅ prefer persona name, fallback to teacher user name/email
                        lr.getDecidedByPersonaName() != null
                                ? lr.getDecidedByPersonaName()
                                : (lr.getDecidedBy() != null
                                ? (lr.getDecidedBy().getFullName() != null
                                ? lr.getDecidedBy().getFullName()
                                : lr.getDecidedBy().getEmail())
                                : null)
                ))
                .toList();
    }
}
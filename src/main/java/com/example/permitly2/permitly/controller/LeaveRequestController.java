package com.example.permitly2.permitly.controller;

import com.example.permitly2.permitly.dto.CreateLeaveRequestRequest;
import com.example.permitly2.permitly.dto.TeacherDecisionHistoryDTO;
import com.example.permitly2.permitly.dto.TeacherPendingLeaveDTO;
import com.example.permitly2.permitly.entity.*;
import com.example.permitly2.permitly.repository.LeaveRequestRepository;
import com.example.permitly2.permitly.repository.UserRepository;
import com.example.permitly2.permitly.service.LeaveRequestService;
import com.example.permitly2.permitly.service.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import com.example.permitly2.permitly.dto.TeacherDecisionRequest;

@RestController
@RequestMapping("/api/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {

    private final NotificationService notificationService;
    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final LeaveRequestService leaveRequestService; // ✅ injected service

    // ===============================
    // CREATE REQUEST (Student)
    // ===============================
    @PostMapping
    public LeaveRequest create(
            @RequestBody CreateLeaveRequestRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();
        User student = userRepository.findByEmail(email).orElseThrow();

        boolean alreadyExists = leaveRequestRepository
                .existsByStudent_IdAndDateAndStartTimeAndEndTime(
                        student.getId(),
                        request.getDate(),
                        request.getStartTime(),
                        request.getEndTime()
                );

        if (alreadyExists) {
            throw new RuntimeException("You already submitted a request for the same date & time.");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setTitle(request.getTitle());
        leaveRequest.setType(request.getType());
        leaveRequest.setDate(request.getDate());
        leaveRequest.setStartTime(request.getStartTime());
        leaveRequest.setEndTime(request.getEndTime());
        leaveRequest.setReason(request.getReason());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        leaveRequest.setStudent(student);

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);

        String title = saved.getTitle() == null ? "(untitled)" : saved.getTitle();

        // 🔔 Notify student
        notificationService.createNotification(
                student,
                "Your leave request '" + title + "' was submitted.",
                NotificationType.NEW_REQUEST,
                saved.getId()
        );

        // 🔔 Notify all teachers
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.TEACHER)
                .forEach(teacher ->
                        notificationService.createNotification(
                                teacher,
                                student.getFullName() + " submitted a leave request '" + title + "'.",
                                NotificationType.NEW_REQUEST,
                                saved.getId()
                        )
                );

        return saved;
    }

    // ===============================
    // GET PENDING (Teacher)
    // ===============================
    @GetMapping("/pending")
    public List<TeacherPendingLeaveDTO> getPending() {
        return leaveRequestService.getPendingForTeacher(); // ✅ correct call
    }

    // ===============================
    // GET MY REQUESTS (Student)
    // ===============================
    @GetMapping("/my")
    public List<LeaveRequest> getMyRequests(Authentication authentication) {
        String email = authentication.getName();
        User student = userRepository.findByEmail(email).orElseThrow();
        return leaveRequestRepository.findByStudent_Id(student.getId());
    }

    // ===============================
    // UPLOAD PROOF
    // ===============================
    @PostMapping(value = "/{id}/proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public LeaveRequest uploadProof(
            @PathVariable String id,
            @RequestParam("proof") MultipartFile proof,
            Authentication authentication
    ) throws Exception {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.getStudent().getId().equals(user.getId())) {
            throw new RuntimeException("Not your request");
        }

        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String original = proof.getOriginalFilename() == null ? "proof" : proof.getOriginalFilename();
        String safeOriginal = original.replaceAll("[^a-zA-Z0-9._-]", "_");

        String filename = UUID.randomUUID() + "_" + safeOriginal;
        Path filePath = uploadPath.resolve(filename);

        proof.transferTo(filePath.toFile());

        leaveRequest.setProofUrl("/uploads/" + filename);

        return leaveRequestRepository.save(leaveRequest);
    }

    // ===============================
    // APPROVE (Teacher)
    // ===============================
    @PostMapping("/{id}/approve")
    public LeaveRequest approve(
            @PathVariable String id,
            @RequestBody TeacherDecisionRequest body,
            Authentication authentication
    ) {
        String teacherEmail = authentication.getName();
        User teacher = userRepository.findByEmail(teacherEmail).orElseThrow();

        LeaveRequest saved = leaveRequestService.approve(id, teacher, body.getTeacherPersonaId());

        String title = saved.getTitle() == null ? "(untitled)" : saved.getTitle();
        String who = saved.getDecidedByPersonaName() != null ? saved.getDecidedByPersonaName() : teacher.getFullName();

        notificationService.createNotification(
                saved.getStudent(),
                "Your leave request '" + title + "' was approved by " + who + ".",
                NotificationType.APPROVED,
                saved.getId()
        );

        return saved;
    }
    @PostMapping("/{id}/reject")
    public LeaveRequest reject(
            @PathVariable String id,
            @RequestBody TeacherDecisionRequest body,
            Authentication authentication
    ) {
        String teacherEmail = authentication.getName();
        User teacher = userRepository.findByEmail(teacherEmail).orElseThrow();

        LeaveRequest saved = leaveRequestService.reject(id, teacher, body.getTeacherPersonaId());

        String title = saved.getTitle() == null ? "(untitled)" : saved.getTitle();
        String who = saved.getDecidedByPersonaName() != null ? saved.getDecidedByPersonaName() : teacher.getFullName();

        notificationService.createNotification(
                saved.getStudent(),
                "Your leave request '" + title + "' was rejected by " + who + ".",
                NotificationType.REJECTED,
                saved.getId()
        );

        return saved;
    }



    // ===============================
    // UPDATE (Student)
    // ===============================
    @PutMapping("/{id}")
    public LeaveRequest updateRequest(
            @PathVariable String id,
            @RequestBody CreateLeaveRequestRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();
        User student = userRepository.findByEmail(email).orElseThrow();

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));

        if (!leaveRequest.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Not your request");
        }

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("You can only edit pending requests");
        }

        leaveRequest.setTitle(request.getTitle());
        leaveRequest.setType(request.getType());
        leaveRequest.setDate(request.getDate());
        leaveRequest.setStartTime(request.getStartTime());
        leaveRequest.setEndTime(request.getEndTime());
        leaveRequest.setReason(request.getReason());

        LeaveRequest updated = leaveRequestRepository.save(leaveRequest);

        return updated;
    }

    // ===============================
    // HISTORY (Teacher)
    // ===============================
    @GetMapping("/history")
    public List<TeacherDecisionHistoryDTO> history(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getRole() != Role.TEACHER) {
            throw new RuntimeException("Only teachers can view decision history");
        }

        return leaveRequestService.getDecisionHistory();
    }
}
